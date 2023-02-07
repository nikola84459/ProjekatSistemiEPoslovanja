import Ajv from 'ajv';

interface IIsplataNovcaSve {
    racun_id: number;
}

const ajv = new Ajv();

const IIsplataNovcaSveValidator = ajv.compile({
    type: "object",
    properties: {
        racun_id: {
            type: "integer"
        },
      
    },

    required: [
        "racun_id",
           
    ],

    additionalProperties: false,
});

export {IIsplataNovcaSve};
export {IIsplataNovcaSveValidator};