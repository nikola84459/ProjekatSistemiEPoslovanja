import Ajv from 'ajv';

interface IKorisnikLogin {
    username: string;
    password: string;
}

const ajv = new Ajv();

const ILoginValidator = ajv.compile({
    type: "object",
    properties: {
        username: {
            type: "string",
            minLength: 1,
            maxLength: 13
        },

        password: {
            type: "string",
            minLength: 8,
            maxLength: 255
        }
    },

    required: [
        "username",
        "password"
    ],

    additionalProperties: false,
});

export {IKorisnikLogin};
export {ILoginValidator};