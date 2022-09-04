import Ajv from "ajv";

interface IAddKorisnik {
    ime: string;
    prezime: string;
    jmbg: string;
    brLicneKarte: string;
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
            maxLength: 13
        },

        brLicneKarte: {
            type: "string",
            maxLength: 11
        },
    },

    required: [
        "ime",
        "prezime",
        "jmbg",
        "brLicneKarte"
    ],

    additionalProperties: false
});

export {IAddKorisnik};
export {IAddKorisnikValidator};