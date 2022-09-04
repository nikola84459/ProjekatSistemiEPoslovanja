import * as express from "express";
import IApplicationResources from "./IAplicationResources.interface";

export default interface IRouter {
    setupRoutes(application: express.Application, resources: IApplicationResources);
}