import { BrowserRouter, Switch, Route } from "react-router-dom";
import Menu from "../Menu/Menu";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Transakcija from "../Transakcija/Transakcija"
import Menjacnica from "../Menjacnica/Menjacnica";
import "./Aplication.css"
import RacuniPage from '../RacuniPage/RacuniPage';
import TransakcijaPregledPage from '../TransakcijaPregledPage/TransakcijaPregledPage';
import KorisnikPodaciPage from '../KorisnikPodaciPage/KorisnikPodaciPage';
import IzmenaSifre from '../IzmenaSifreComponent/IzmenaSifre';
import DodajKorisnikaPage from '../Sluzbenik/DodajKorisnika/DodajKorisnikaPage';
import DodajRacunPage from '../Sluzbenik/DodajRacun/DodajRacunPage';
import PretragaKorisnikaComponent from '../PretragaKorisnikaComponent/PretragaKorisnikaComponent';
import PodaciKorisnikSluzbenikComponent from '../PodaciKorisnikSluzbenikComponent/PodaciKorisnikSluzbenik';
import IzmenaPodatakaKorisnikComponent from '../IzmenaPodatakaKorisnikComponent/IzmenaPodatakaKorisnikComponent';
import DodajRacunPostojeciKorisnikComponent from '../DodajRacunPostojeciKorisnikComponent/DodajRacunPostojeciKorisnikComponent';
import KorisnikLogInComponent from '../KorisnikLogInComponent/KorisnikLogInComponent';
import IzborUlogeComponent from '../IzborUlogeComponent/IzborUlogeComponent';
import React from 'react';
import api from '../../Api/api';
import EventRegister from "../../Api/EventRegister";
import SluzbenikLogInComponent from '../SluzbenikLogInComponent/SluzbenikLogInComponent';
import SluzbenikPocetnaComponent from "../SluzbenikPocetnaComponent/SluzbenikPocetnaComponent";
import LogOut from '../KorisnikLogInComponent/LogOut';
import SluzbenikLogOut from '../SluzbenikLogInComponent/SluzbenikLogOut';
import HeaderComponent from "../NaslovComponent/NaslovComponent";
import IzmenaSifreSluzbenikComponent from '../IzmenaSifreSluzbenikComponent/IzmenaSifreSluzbenikComponent';
import IsplataNovcaComponent from '../IsplataNovcaComponent/IsplataNovcaComponent';
import PrvaPrijavaIzmenaSifre from '../IzmenaSifreComponent/PrvaPrijavaIzmenaSifre';

class AplicationState {
    authUloga: "korisnik" | "sluzbenik" | null = null;
    
}

export default class Aplication extends React.Component {
    state: AplicationState;

    constructor(props: any) {
        super(props);

        this.state = {
            authUloga: null,
            
        }

    }

    componentDidMount(): void {
        
        EventRegister.on("AUTH_EVENT", this.authEventHandler.bind(this))
   
        this.vratiUlogu("korisnik");
        this.vratiUlogu("sluzbenik");
    }

    componentWillUnmount(){
        EventRegister.off("AUTH_EVENT", this.authEventHandler.bind(this));
    }
    
    private authEventHandler(status: string) {
        if(status === "korisnik_logIn_uspesno") {
            return this.setState({
                authUloga: "korisnik"
            })
        } 
        if (status === "sluzbenik_logIn_uspesno") {
            return this.setState({
                authUloga: "sluzbenik"
            })

        }
        if(status === "force_login" || status === "korisnik_logout" || status === "sluzbenik_logout" || status === "korisnik_login_prva_prijava") {
            return this.setState({
                authUloga: null
            })

        }
    }

    private vratiUlogu(uloga: "korisnik" | "sluzbenik") {
        api("get", "/auth/" + uloga + "/vratiUlogu", uloga)
        .then(res => {
            if(res.data === "ok") {
                this.setState({
                    authUloga: uloga
                })
               EventRegister.emit("AUTH_EVENT", uloga + "_login_usepsno")
            }
        
        })
        .catch(() => {})
    }
            
    render() {
        console.log(this.state.authUloga);
        return (
            <BrowserRouter>
               <div className="header">
                    <h1>Informacioni sistem banke</h1>
               </div>
                {
                this.state.authUloga !== null ? (
                    <Menu uloga = {this.state.authUloga} />
                ): ""}
                <div className="Aplication-body">
                    <Switch>
                        <Route exact path="/" component={ IzborUlogeComponent } />

                        <Route path="/security/prijavaKorisnik" component={ KorisnikLogInComponent } />

                        <Route path="/security/prijavaSluzbenik" component={ SluzbenikLogInComponent } />
                        
                        <Route path="/korisnik/pregledRacuni"  component={RacuniPage} />
                                                                 
                        <Route path="/transakcija" component={ Transakcija } />

                        <Route path="/pregledTransakcija/:id" component={ TransakcijaPregledPage} />
                                            
                        <Route path="/menjacnica" component={ Menjacnica } />

                        <Route path="/licniPodaci" component={ KorisnikPodaciPage } />

                        <Route path="/izmenaSifre">
                            <IzmenaSifre naslov="Izmena sifre" isPrvaPrijava={false} />
                        </Route>

                        <Route path="/dodajKorisnika" component={ DodajKorisnikaPage } />
                        
                        <Route path="/dodajRacun" component={ DodajRacunPage } />

                        <Route path="/pretragaKorisnika" component={ PretragaKorisnikaComponent } />

                        <Route path="/podaciKorisnik" component={ PodaciKorisnikSluzbenikComponent } />

                        <Route path="/izmenaPodaciKorisnik" component={ IzmenaPodatakaKorisnikComponent }/>

                        <Route path="/dodajRacunPostojeciKorisnik" component={ DodajRacunPostojeciKorisnikComponent } />

                        <Route path="/sluzbenikPocetna" component={ SluzbenikPocetnaComponent } />

                        <Route path="/isplataNovca/:id" component={ IsplataNovcaComponent } />

                        <Route path="/odjavaKorisnik" component={ LogOut } />

                        <Route path="/odjavaSluzbenik" component={ SluzbenikLogOut } />
                        
                        <Route path="/izmenaSifreSluzbenik" component={ IzmenaSifreSluzbenikComponent } />

                        <Route path="/prvaPrijava" component={ PrvaPrijavaIzmenaSifre } />
                        
                    </Switch>
                </div>
           </BrowserRouter>
        
        )
    }
}