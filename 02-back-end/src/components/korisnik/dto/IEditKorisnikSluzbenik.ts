import Ajv from "ajv";

interface IEditKorisnikSluzbenik {
    ime: string,
    prezime: string,
    brTelefona: string,
    brLicneKarte: string,
    ulica: string;
    broj: string;
    mesto: string;
    email: string;
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

        ulica: {
            type: "string",
            minLength: 2,
            maxLength: 150,     
        },

        broj: {
            type: "string",
            minLength: 1,
            maxLength: 5,     
        },

        mesto: {
            type: "string",
            minLength: 2,
            maxLength: 150,     
        },

        email: {
            type: "string",
            minLength: 5,
            maxLength: 100
        }
    
        
    }, 

    required: [
        "ime",
        "prezime",
        "brTelefona",
        "brLicneKarte",
        "mesto",
        "ulica",
        "broj",
        "email"
    ],    

    additionalProperties: false,
});

export {IEditKorisnikSluzbenik};
export {IEditKorisnikSluzbenikValidator};