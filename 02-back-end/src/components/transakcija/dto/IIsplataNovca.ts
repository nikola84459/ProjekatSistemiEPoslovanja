import Ajv from 'ajv';

interface IIsplataNovca {
    iznos: number;
    valuta_id: number;
    racun_id: number;
}

const ajv = new Ajv();

const IIsplataNovcaValidator = ajv.compile({
    type: "object",
    properties: {
        iznos: {
            type: "number"
            
            
        },

        valuta_id: {
            type: "integer",
        },

        racun_id: {
            type: "integer"
        },
      
    },

    required: [
        "iznos",
        "racun_id",
           
    ],

    additionalProperties: false,
});

export {IIsplataNovca};
export {IIsplataNovcaValidator};