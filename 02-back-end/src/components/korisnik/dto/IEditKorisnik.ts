import Ajv from "ajv";

interface IEditKorisnik {
    password_hash_old: string;
    password_hash: string;
    password_hash_ponovo: string;
    isPrvaPrijava: boolean
}

const ajv = new Ajv();

const IEditKorisnikValidator = ajv.compile({
    type: "object",
    properties: {
        password_hash_old: {
            type: "string",
            minLength: 8,
            maxLength: 255
        },

        password_hash: {
            type: "string",
            minLength: 8,
            maxLength: 255
        },

        password_hash_ponovo: {
            type: "string",
            minLength: 8,
            maxLength: 255    
        },

        isPrvaPrijava: {
            type: "boolean"
        }

    },

    required: [
        "password_hash_old",
        "password_hash",
        "password_hash_ponovo",
        "isPrvaPrijava"
    ],

    additionalProperties: false,
});

export {IEditKorisnik};
export {IEditKorisnikValidator};