import Ajv from "ajv";

interface IPrenosNovca {
    iznos: number;
    valuta_id: number;
    racun_id: number;
    svrha: string;
    brRacuna: string;
}

const ajv = new Ajv();

const IPrenosNovcaValidator = ajv.compile({
    type: "object",
    properties: {
        iznos: {
            type: "number",
            
        },

        valuta_id: {
            type: "integer",
        },

        svrha: {
            type: "string",
            minLength: 2,
            maxLength: 150
        },
       
       
        brRacuna: {
            type: "string",
            minLength: 4,
            maxLength: 50
        },

        racun_id: {
            type: "integer"
        }
       
    },

    required: [
        "iznos",
        "svrha",
        
    ],

    additionalProperties: false,
});

export {IPrenosNovca};
export {IPrenosNovcaValidator};