import Ajv from "ajv";

interface ISearchKorisnik {
    ime: string;
    prezime: string;
    jmbg: string;
    brLicneKarte: string;
}

const ajv = new Ajv();

const ISearchKorisnikValidator = ajv.compile({
    type: "object",
    properties: {
        ime: {
            type: ["string", "null"],
            minLength: 4,
            maxLength: 50
        },

        prezime: {
            type: ["string", "null"],
            minLength: 4,
            maxLength: 50
        },

        jmbg: {
            type: ["string", "null"],
            minLength: 13,
            maxLength: 13    
        },

        brLicneKarte: {
            type: ["string", "null"],
            minLength: 5,
            maxLength: 11   
        }
    },

    required: [

    ],

    additionalProperties: false,
})    

export {ISearchKorisnik};
export {ISearchKorisnikValidator};