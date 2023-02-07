import Ajv from "ajv";

interface IAddAktivnost {
    stranica: string
    radnja: string;
    ipAdresa: string;
    grad: string;
    drzava: string;
    
}

const ajv = new Ajv();

const IAddAktivnostValidator = ajv.compile({
    type: "object",
    properties: {
        stranica: {
            type: "string",
            minLength: 5,
            maxLength: 50            
        },

        radnja: {
            type: "string",
            minLength: 2,
            maxLength: 70
        },

       ipAdresa: {
            type: "string",
            maxLength: 20
            
        },

        grad: {
            type: "string",
            minLength: 2,
            maxLength: 100
        },
              
        drzava: {
            type: "string",
            minLength: 2,
            maxLength: 100
        },
       
    },

    required: [
        "stranica",
        "radnja",
        "ipAdresa",
        "grad",
        "drzava"
        
    ],

    additionalProperties: false,
});

export {IAddAktivnost};
export {IAddAktivnostValidator};