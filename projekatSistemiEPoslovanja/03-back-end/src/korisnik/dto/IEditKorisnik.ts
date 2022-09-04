import Ajv from "ajv";

interface IEditKorisnik {
    password_hash_old: string;
    password_hash: string;
    password_hash_ponovo: string;
}

const ajv = new Ajv();

const IEditKorisnikValidator = ajv.compile({
    type: "object",
    properties: {
        password_hash_old: {
            type: "string",
            minLength: 2,
            maxLength: 255,
        },

        password_hash: {
            type: "string",
            minLength: 2,
            maxLength: 255,    
        },

        password_hash_ponovo: {
            type: "string",
            minLength: 2,
            maxLength: 255,     
        },

        required: [
            "password_hash_old",
            "password_hash",
            "password_hash_ponovo"
        ],

        additionalProperties: false,
    }, 
});

export {IEditKorisnik};
export {IEditKorisnikValidator};