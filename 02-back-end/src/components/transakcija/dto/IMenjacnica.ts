import Ajv from "ajv";

interface IMenjacnica {
    iznos: number;
    valuta_id: number;
    racun_id: number;
    racun_primaoc_id: number;
    isKupovina: boolean
   
}

const ajv = new Ajv();

const IMenjacnicaValidator = ajv.compile({
    type: "object",
    properties: {
        iznos: {
            type: "number",
            
        },

        valuta_id: {
            type: "integer",
        },

        racun_primaoc_id: {
            type: "integer"
        },
       
        racun_id: {
            type: "integer"
        },

        isKupovina: {
            type: "boolean"
        }
       
    },

    required: [
        "iznos",
        "valuta_id",
        "racun_primaoc_id",
        "racun_id",
        "isKupovina"
        
    ],

    additionalProperties: false,
});

export {IMenjacnica};
export {IMenjacnicaValidator};