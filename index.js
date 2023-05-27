const express = require("express");
const app = express();
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');

const { Client } = require('amocrm-js');

const filePathForRefreshTokens = 'refresh_tokens.txt';
const filePathForAccessTokens = 'access_tokens.txt';

const clientId = "0e687859-5200-418f-9a1f-7cd37f72762e";
const clientSecret = "597CfLj8TjFar8ZQ3NO0HCbDPyx0IOoI69mnMWLZpLzDKRLOfZzKXi9P2rFiuWH2";
const code = "def50200e3fac559d8f2fec0d208539baa15a4dba507ac8a0aaa35aa718858634c9377075df41302ee5eda85e85a2d37e8f5093af56fdee3ac93b8a456743624d15c5644bfd9418f2ba164e9cc12ec0f3031afb06913d4797a874fd9bf3bdd191b168cff44764a8ffaca994e5d15f3877f4c76a23659f245148e1dd6b4fc6c8261f293bdf3fd8472e62466dec60bb1e042497d7d55ce2eef36c8adab3026ff8dd3d8fbaeb474c23ac0af9cedd060ae6bec78a868a50247154ac4a37c06f7c068a68885298031ba855a34b668f75f5ff648b52fb828c3e92a914612f578f15d036e2ca0bd554acadc7244beaf02205df444d7a5b0369def82ed667fa8e5c274e503188253c093ec5047f8c7bda5a08a5b6f5a5b406154b4348c85081d5493d1e56a53bd769c42b00708b204a7aba9fe0bd6a7054dfd3d43cd1dd24edb19d299c3d7c1da547126535faaf2aa624bb17f317fd5b1398aebeadef5a49466e50ae3db6a010cb61e398ab35eb4b140dbcc1f0e2dc49782bbf6b04f0597cb404d27f4dcd4dea0d6b5f200bb610d27c4357ae7adf751c2f2e0630dd7872658cf5f199be4f9dc69c823e8c396295a262fdeaab5793604aefb15617423fe5485a91718bef2040bc2d20f978b9adfd73ea27800faeec0bc9d350efbc05bb1e64106d88d9c3f0be9978963ae24edd72756a1";
const redirectUri = "https://itkeyuz.vercel.app/";

const oauthUrl = `https://new1664891527.amocrm.ru/oauth2/access_token`;

// const client = new Client({
//     domain: 'new1664891527',

//     auth: {
//         client_id: clientId,
//         client_secret: clientSecret,
//         code: code,
//         redirect_uri: redirectUri,
//     },
// });


app.use(express.json());

app.listen(process.env.PORT || 3004, () => {
    console.log('server started...')
})

app.get('/', (req, res) => {
    res.send("hello world")
})

setInterval(() => {
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

}, 50000)

app.get('/data', (req, res) => {
    // const formData = querystring.stringify({
    //   client_id: clientId,
    //   client_secret: clientSecret,
    //   grant_type: "authorization_code",
    //   code: code,
    //   redirect_uri: redirectUri
    // });
})

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

// (async () => {
//         const response = await client.request.post('/api/v4/contacts', [
//             {
//                 name: "Walter White",
//                 request_id: 143,
//             }
//         ]);
//         console.log(response);
// })()

