const express = require("express");
const app = express();
const axios = require('axios');
const querystring = require('querystring');
const cron = require('node-cron');
const fs = require('fs');
const cors = require("cors");

const filePathForRefreshTokens = 'refresh_tokens.txt';
const filePathForAccessTokens = 'access_tokens.txt';

const clientId = "0e687859-5200-418f-9a1f-7cd37f72762e";
const clientSecret = "597CfLj8TjFar8ZQ3NO0HCbDPyx0IOoI69mnMWLZpLzDKRLOfZzKXi9P2rFiuWH2";
const code = "def502008fbad092ef3f45294bbde73b33e66539857ab8823d33753a170fd9cc1e6ed109fcb9ecc3590ef4f502fc3f13a09ba30f12f46a7abe483c293f98dca9dc3e198eb66d088c6f0fe2a3a2b931231436938ac2d37a1fbfb76b52b1de2aa8fb0632b41c523a5de88776331ef3d3a48e15b5185f70d97c1f23f5a25c04a834952b3232ca20b9e02ac21a52e5c645305a890b5ecc470bec463d9cfe5fbfbbd02048d16366d264fb568dc7652460cee03d35256535680b8892eddbd87583b58a1244af7a979e8eea0bdcf6a2e2e5ea220d45d5ad025df7046ee6c6c1d230614e0b79009735c49074ec39e8e31d56fed648192978215126357af0ca244649b7fee917abffb5600a26808ff432006e88c73ddc79f4669bf9b92dadfadf88e50f6348d8297a96a317fea8576ebaef17c3f5cae91c93975318626f021e0b5261a368f35c49153a2349e2d974b4b36e06851173fc394d3928d2c6806242460d920fd927c968556797a4bd2a7d6d0f94efddaaa4bfc12e05d0ed1ea9d99ee4fe60fc5fe5237b05af04b9ab590335aaf692d87099606d18db1d4f50973c3aa84358723c515821e82b0559e06e86abb12966f95b9c593af04f130da0e3434daccbb3ef9486bf6f8aea126bbe7147de8b7393135f8c19a534d011130b657c83d356393de1c09c99de4a7e8e91b12f60ef";
const redirectUri = "https://itkeyuz.vercel.app/";

const oauthUrl = `https://new1664891527.amocrm.ru/oauth2/access_token`;

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT || 3004, () => {
    console.log('server started...')
})

app.get('/', (req, res) => {
    res.send("hello world")
})

app.post('/data', (req, res) => {
    const { refreshCode } = req.body;

    const formData = querystring.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: refreshCode,
        redirect_uri: redirectUri
    });

    axios.post(oauthUrl, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        fs.writeFile(filePathForRefreshTokens, response.data.refresh_token, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('RefreshToken Code written successfully!');
            }
        });
        res.json("success");
    }).catch((err) => {
        console.log(err);
    })
})

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

cron.schedule('0 */8 * * *', () => {
    writeTokens();
});

writeTokens();

app.post('/create', (req, res) => {
    const { name, phone } = req.body;

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

        // const contacts = [
        //     {
        //         name: name,
        //         responsible_user_id: 9649578,
        //         custom_fields_values: [
        //             {
        //                 field_id: 866999,
        //                 values: [
        //                     {
        //                         value: phone,
        //                         enum_code: "WORK"
        //                     }
        //                 ]
        //             }
        //         ],
        //     }
        // ] 

        const contacts = [
            {
                name: "Itkey Сделки",
                price: 0,
                _embedded: {
                    contacts: [
                        {
                            first_name: name,
                            created_at: 1608905348,
                            responsible_user_id: 9649578,
                            updated_by: 0,
                            custom_fields_values: [
                                {
                                    field_id: 866999,
                                    values: [
                                        {
                                            enum_code: "WORK",
                                            value: phone
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            }
        ]

        await axios.post('https://new1664891527.amocrm.ru/api/v4/leads/complex', contacts, config)
            .then((response) => {
                res.json(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        // await axios.post('https://new1664891527.amocrm.ru/api/v4/contacts', contacts, config)
        //     .then((response) => {
        //         res.json(response.data);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
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

