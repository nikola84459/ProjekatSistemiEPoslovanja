import Ajv from "ajv";

interface IIsPotipsao {
    isPotpisao: boolean;
    racunId: number;
    
}

const ajv = new Ajv();

const IIsPotpisaoValidator = ajv.compile({
    type: "object",
    properties: {
        isPotpisao: {
            type: "boolean",

        },

        racunId: {
            type: "integer",
        }
    },

    required: [
        "isPotpisao",
        "racunId"
    ],

    additionalProperties: false,
});

export {IIsPotipsao};
export {IIsPotpisaoValidator};