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
const code = "def502006b96e45f1e6818c620ca7a3ef888369cfcb45e94b4b73155518b7f5bea986a3eaec837d4f233a592074b8881e357e512809c2c97d076f840b7d865431ff7f0ee3184440e356f35891972996219baa3f9b7b8f093a52145b0dc7d5255800585ed9a01317ffb4efbb7b80ebcdc4f9109087092f2a7cdce805afaca472cf5769b61ceccf8424a6019ee6d53753d93ba505d170d9693dcf622b8e21901ffca9bb56fbc718b28834bbc380a7631a2ba3aaa1e885699ea6aa69d1d33caaddef87c20807d1e09e8218ed8f83b6ff4ff1b39793df343fa08da3eca249ee80431278c5811d6993fe7feb09cefa5038d9d038f2db4ecb9b80dc7a6f0c8af8659f14ec6471fabe53f37f3fbbb9a2b7d1eb16880f6dcf6262233972d0ee5e64151f4a3c004de81b77b7df2ac5b6ace8cb5ee0e4e8f85794010abea4688d45b634fe4fa2e82b6457046217a5035b46180bfd5f58953b64fc38a6e6a94972cb000e2a5d4e88800d31a0662d48bbd11974850418834b4de0d7611b0d5aca66d70fc36e746693e90146bf628b0d855e2db534fb02c952769c5b83c358121976036d7b87a639f1e97195e86526690fa8c8d75dea3c79c318608b64a4335665909099cb0b398013ec2144b723d95dda5bc75fba5bf0c6c7cede37fc72a91e3a7621d97b35441981537113877ed23592720";
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

cron.schedule('0 */8 * * *', () => {
    writeTokens();
});

// writeTokens();

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

        await axios.post('https://new1664891527.amocrm.ru/api/v4/contacts', contacts, config)
            .then((response) => {
                res.json(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
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

