import Ajv from "ajv";

interface IAddRacun {
    tip: string;
    valuta: any;
    svrha: string;
    isPotpisao: boolean;
    racunId: number;
    
}

const ajv = new Ajv();

const IAddRacunValidator = ajv.compile({
    type: "object",
    properties: {
        tip: {
            type: "string",
            maxLength: 10,
            
        },

       
        valuta: {
            type: "array",
            
        },

        svrha: {
            type: "string",
            minLength: 5,
            maxLength: 255
        },

        isPotpisao: {
            type: "boolean",

        },

        racunId: {
            type: "integer",
        }
    },

    required: [
        "tip",
        "svrha"
    ],

    additionalProperties: false,
});

export {IAddRacun};
export {IAddRacunValidator};

