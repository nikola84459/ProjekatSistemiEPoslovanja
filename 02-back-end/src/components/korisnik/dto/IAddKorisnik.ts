import Ajv from "ajv";

interface IAddKorisnik {
    ime: string;
    prezime: string;
    jmbg: string;
    brTelefona: string;
    brLicneKarte: string;
    ulica: string;
    broj: string;
    mesto: string
    email: string;
    mestoRodjenja: string;
    drzavaRodjenja: string;
    opstinaRodjenja: string;
    datumRodjenja: string;
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

        ulica: {
            type: "string",
            minLength: 2,
            maxLength: 170
        },

        broj: {
            type: "string",
            minLength: 1,
            maxLength: 5,
        },

        mesto: {
            type: "string",
            minLength: 2,
            maxLength: 170
        },

        email: {
            type: "string",
            minLength: 2,
            maxLength: 200
        },

        mestoRodjenja: {
            type: "string",
            minLength: 2,
            maxLength: 150
        },

        drzavaRodjenja: {
            type: "string",
            minLength: 2,
            maxLength: 150
        },
        
        opstinaRodjenja: {
            type: "string",
            minLength: 2,
            maxLength: 150
        },
        
        datumRodjenja: {
            type: "string",
            minLength: 1,
            maxLength: 15
        }
    },

    required: [
        "ime",
        "prezime",
        "jmbg",
        "brLicneKarte",
        "ulica",
        "broj",
        "mesto",
        "email",
        "mestoRodjenja",
        "drzavaRodjenja",
        "opstinaRodjenja",
        "datumRodjenja"
    ],

    additionalProperties: false
});

export {IAddKorisnik};
export {IAddKorisnikValidator};