import Ajv from "ajv";

interface IAddKorisnik {
    ime: string;
    prezime: string;
    jmbg: string;
    brTelefona: string;
    brLicneKarte: string;
    adresa: string;
    email: string;
}

const ajv = new Ajv();

const IAddKorisnikValidator = ajv.compile({
    type: "object",
    properties: {
        ime: {
            type: "string",
            minLength: 2,
            maxLength: 150 
        },

        prezime: {
            type: "string",
            minLength: 2,
            maxLength: 150
        },

        jmbg: {
            type: "string",
            minLength: 13,
            maxLength: 13
        },

        brTelefona: {
            type: "string",
            maxLength: 10
        },

        brLicneKarte: {
            type: "string",
            maxLength: 11
        },

        adresa: {
            type: "string",
            minLength: 2,
            maxLength: 170
        },

        email: {
            type: "string",
            minLength: 2,
            maxLength: 200
        }

    },

    required: [
        "ime",
        "prezime",
        "jmbg",
        "brLicneKarte",
        "adresa",
        "email"
        
    ],

    additionalProperties: false
});

export {IAddKorisnik};
export {IAddKorisnikValidator};