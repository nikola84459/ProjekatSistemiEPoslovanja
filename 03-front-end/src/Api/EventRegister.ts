import { EventEmitter } from "eventemitter3";
import { once } from "events";

const register = new EventEmitter();

type EventType = "AUTH_EVENT" 
            

type EventHandler = (...args: any[]) => void;

const EventRegister = {
    on: (event: EventType, handler: EventHandler) => register.on(event, handler),
    once: (event: EventType, handler: EventHandler) => register.once(event, handler),
    off: (event: EventType, handler: EventHandler) => register.off(event, handler),
    emit: (event: EventType, ...data: any[]) => register.emit(event, ...data),
};

Object.freeze(EventRegister);

export default EventRegister;