const express = require("express");
const app = express();
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');

const filePathForRefreshTokens = 'refresh_tokens.txt';
const filePathForAccessTokens = 'access_tokens.txt';

const clientId = "0e687859-5200-418f-9a1f-7cd37f72762e";
const clientSecret = "597CfLj8TjFar8ZQ3NO0HCbDPyx0IOoI69mnMWLZpLzDKRLOfZzKXi9P2rFiuWH2";
const code = "def50200993ff6cfa9c2d6a70e63355320f1b4c4feadb71bc25f012acbc7de3af58c9f3e7d10580a83b422d0c23ebd34054ca20c7aa982690b4bd8de9f161f94c552f4d65d648209d40f3c06e88cc23d33fd32faa026c9d96b4519cac36473883c460cd56cf61781de6c20eff63bf72fc01fed77debf8f1235f248ac3856fa251f641b4a9b5134241fd9ecd7cb829e835770e1d659b8469fc1d90ccc5f1ecd01ba4663e1dbab91bd22bd6e95b46ff0b231c8d6aa799530f6b655de6ba88bacbf87eeddca0b69ea0da506743518a0f90141a6034ddc1b2217a01fb9ef040cb44afc420a813ea20105925ae7b23c67cd2831483d1d78145aa928f06a40895a081002e252a3624065fb5c12c98883a88e1a58523234983ba103806f3ccef3120f69685cbba9a45aaac8d42c83384b5069b8ecf1cb4d3eaa3f15c061a13aba509af9f2343563212f5a5209979bd5fd9c152c6c11b7bca0ce790b336df7a2bc61ef581d3c0a33d9b28667561bffe60d4f038fcd79ceda48e2894e8729bdd861995d9225de2e9e7663e9ce201b1a2933b13f84862b97b851d46f9f85c36e99e726d3649247a42107a1b4fc76ee8bd042de017735145f08cd6a90f3c80c88742b1396cc1738e3b1b976855541ae5286ac2d1e943fb0b8a199795f735a519a52188477ea5a9800b7b3d759688de48a97";
const redirectUri = "https://itkeyuz.vercel.app/";

const oauthUrl = `https://new1664891527.amocrm.ru/oauth2/access_token`;

app.use(express.json());

app.listen(process.env.PORT || 3004, () => {
    console.log('server started...')
})

app.get('/', (req, res) => {
    res.send("hello world")
})

// app.get('/data', (req, res) => {
//     const formData = querystring.stringify({
//         client_id: clientId,
//         client_secret: clientSecret,
//         grant_type: "authorization_code",
//         code: code,
//         redirect_uri: redirectUri
//     }); 

//     axios.post(oauthUrl, formData, {
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     }).then((response) => {
//         console.log(response);
//         res.json("success");
//     })

// })

async function writeTokens() {
    fs.readFile(filePathForRefreshTokens, 'utf8', (err, refreshToken) => {
        if (err) {
            console.log(err);
        } else {
            const formData = querystring.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token: `${refreshToken}`,
                redirect_uri: redirectUri
            });

            axios.post(oauthUrl, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then((response) => {
                    console.log(response);
                    fs.writeFile(filePathForRefreshTokens, response.data.refresh_token, (err) => {
                        if (err) {
                            console.error('Error writing to file:', err);
                        } else {
                            console.log('RefreshToken written successfully!');
                        }
                    });

                    fs.writeFile(filePathForAccessTokens, response.data.access_token, (err) => {
                        if (err) {
                            console.error('Error writing to file:', err);
                        } else {
                            console.log('AccessToken written successfully!');
                        }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    })
}

// writeTokens();

app.post('/create', (req, res) => {
    const { name, phone } = req.body;

    writeTokens()
        .then(() => {
            fs.readFile(filePathForAccessTokens, 'utf8', async (err, accessToken) => {
                if (err) {
                    console.log(err);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                };

                const contacts = [
                    {
                        name: name,
                        responsible_user_id: 9649578,
                        custom_fields_values: [
                            {
                                field_id: 866999,
                                values: [
                                    {
                                        value: phone,
                                        enum_code: "WORK"
                                    }
                                ]
                            }
                        ],
                    }
                ]

                await axios
                    .post('https://new1664891527.amocrm.ru/api/v4/contacts', contacts, config)
                    .then((response) => {
                        res.json(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
        })
        .catch((err) => {
            console.log(err);
        })
})





// const client = new Client({
//     domain: 'new1664891527',

//     auth: {
//         client_id: clientId,
//         client_secret: clientSecret,
//         code: code,
//         redirect_uri: redirectUri,
//     },
// });

// (async () => {
//         const response = await client.request.post('/api/v4/contacts', [
//             {
//                 name: "Walter White",
//                 request_id: 143,
//             }
//         ]);
//         console.log(response);
// })()

