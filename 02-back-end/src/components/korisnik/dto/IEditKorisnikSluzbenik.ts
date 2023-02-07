import Ajv from "ajv";

interface IEditKorisnikSluzbenik {
    ime: string,
    prezime: string,
    brTelefona: string,
    brLicneKarte: string,
    adresa: string;
}

const ajv = new Ajv();

const IEditKorisnikSluzbenikValidator = ajv.compile({
    type: "object",
    properties: {
        ime: {
            type: "string",
            minLength: 2,
            maxLength: 100,
        },

        prezime: {
            type: "string",
            minLength: 2,
            maxLength: 100,    
        },

        brTelefona: {
            type: "string",
            minLength: 2,
            maxLength: 11,     
        },

        brLicneKarte: {
            type: "string",
            minLength: 2,
            maxLength: 11,     
        },

        adresa: {
            type: "string",
            minLength: 2,
            maxLength: 255,     
        },

        required: [
            "ime",
            "prezime",
            "brTelefona",
            "brLicneKarte",
            "adresa"
        ],

        additionalProperties: false,
    }, 
});

export {IEditKorisnikSluzbenik};
export {IEditKorisnikSluzbenikValidator};