import axios, { AxiosResponse } from 'axios';
import { AppConfiguration } from '../config/app.config';
import { Response } from 'express';
import { EventEmitter } from 'eventemitter3';
import EventRegister from './EventRegister';

type ApiMethod = "get" | "post" | "put" | "delete";
export type ApiRole = "korisnik" | "sluzbenik";
type ApiResponseStatus = "ok" | "error" | "login";

export interface ApiResponse {
    status: ApiResponseStatus
    data: any
}

export default function api(
    method: ApiMethod,
    path: string,
    role: ApiRole = "korisnik",
    body: any | undefined = undefined,
    credentials?: boolean,
    attemptToRefresh: boolean = true
): Promise<ApiResponse> {
    return new Promise<ApiResponse>(reslove => {
        axios({
            method: method,
            baseURL: AppConfiguration.API_URL,
            url: path,
            data: body ? JSON.stringify(body) : "",
            withCredentials: credentials,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + getAuthToken(role),
                
            },
                           
        }).then(res => {
            responseHeanlder(res, reslove)
        })
        .catch(async err => {
            if(attemptToRefresh && ("" + err).includes("401")) {
                const noviToken: string | null = await refreshToken(role); 
                
                if(noviToken === null) {
                    return reslove({
                        status: "login",
                        data: null
                    })
                }

                saveAuthToken(role, noviToken);

                api(method, path, role, body, false, true)
                .then(res => {
                    reslove(res);
                })
                .catch(() => {
                    reslove({
                        status: "login",
                        data: null
                    });
                });
                return;
            }

            if(err?.response?.status === 401) {
                return reslove({
                    status: "login",
                    data: null
                });
            }

            if(err?.response?.status === 403) {
                return reslove({
                    status: "login",
                    data: err.response.data
                });
            }

            return reslove ({
                status: "error",
                data: [err?.response]
            });
        })
        
    });
}

function responseHeanlder(res: AxiosResponse<any>, reslove: (data: ApiResponse) => void) {
    if(res?.status < 200 ||  res?.status >= 300) {
        return reslove({
            status: "error",
            data: "" + res            
        });

    }

    return reslove({
        status: "ok",
        data: res.data
    });
   
}

function getAuthToken(role: ApiRole): string {
    return localStorage.getItem(role + "-auth-token") ?? "";
}

function getRefreshToken(role: ApiRole): string {
    return localStorage.getItem(role + "-refresh-token") ?? "";
}

export function saveAuthToken(role: ApiRole, token: string) {
    localStorage.setItem(role + "-auth-token", token);    
}

export function saveRefreshToken(role: ApiRole, token: string) {
    localStorage.setItem(role + "-refresh-token", token);    
}

function getIdentity(role: ApiRole): string {
    return localStorage.getItem(role + "-identity") ?? "";
}

function refreshToken(role: ApiRole): Promise<string | null> {
    return new Promise<string | null>(reslove => {
        axios({
            method: "post",
            baseURL: AppConfiguration.API_URL,
            url: "/auth/" + role + "/refreshToken",
            data: JSON.stringify({
                refreshToken: getRefreshToken(role)
            }),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'    
            }
        })
        .then(res => {
            refreshTokenResponseHendler(res, reslove);   
        })
        .catch(() => {
            reslove(null);
        })
    })

}

function refreshTokenResponseHendler(res: AxiosResponse<any>, reslove: (data: string | null) => void) {
    if(res.status !== 200) {
        reslove(null)
    }
    reslove(res.data?.authToken);
}

export function isUlogaUlogovana(uloga: ApiRole): Promise<boolean> {
    return new Promise<boolean>(reslove => {
        api("get", "/auth/" + uloga + "/vratiUlogu", uloga)
        .then(res => {
            if(res?.data === "ok") {
                reslove(true)
            } else {
                reslove(false)
                
                saveAuthToken(uloga, "");
                saveRefreshToken(uloga, "");
            }
            
            
        })
        .catch(() => {
            reslove(false)
        })
    })
}