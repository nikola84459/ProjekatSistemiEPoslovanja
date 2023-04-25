import React from "react";
import { saveAuthToken, saveRefreshToken } from '../../Api/api';
import { Redirect } from 'react-router-dom';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import EventRegister from '../../Api/EventRegister';

class LogOutState {
    isLogOut: boolean;
}

export default class LogOut extends React.Component{
    state: LogOutState;

    constructor(props: any) {
        super(props)

        this.state = {
            isLogOut: false
        }
    }

    private async odjava() {
        await addAktivnost(window.location.href, "Službenik logout", "sluzbenik");
        
        saveAuthToken("sluzbenik", "");
        saveRefreshToken("sluzbenik", "");

        this.setState({
            isLogOut: true
        })

        EventRegister.emit("AUTH_EVENT", "sluzbenik_logout")
       
    }

    componentDidMount(): void {
        this.odjava();   
    }

    render() {
        if(this.state.isLogOut) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }
        return(
            <p>Sačekajte da vas odjavimo...</p>
        )
    }

}