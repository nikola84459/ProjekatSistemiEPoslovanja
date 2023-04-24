import BasePage from "../BasePage/BasePage";
import KorisnikModel from '../../../../03-back-end/src/components/korisnik/model';
import { Container, Table } from 'react-bootstrap';
import KorisnikService from "../../services/KorisnikService";
import "./korisnikPodacipage.css"
import {Link} from "react-router-dom"
import getLocationAndIp from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import NaslovComponent from "../NaslovComponent/NaslovComponent";

class KorisniciPageState {
    korisnik: KorisnikModel | null
}

export default class KorisnikPodaciPage extends BasePage<{}> {
    state: KorisniciPageState;

    constructor(props: any) {
        super(props)

        this.state = {
            korisnik: null
        }
    }

    private getKorisnik() {
        KorisnikService.getKorisnik()
        .then(res => {
            this.setState(
                {
                    korisnik: res
                }
            )
        })
    }
   

    componentDidMount() {
        this.getKorisnik();
        addAktivnost(window.location.href, "Pregled ličnih podataka", "korisnik");
    }
    
    renderMain(): JSX.Element {
        return (
            <Container className="podaci">
                <NaslovComponent poruka="Lični podaci" />
            <Table className="tabela" striped bordered hover size="sm">
            <tbody>
              <tr>
                <th>Ime</th>
                <td>{this.state.korisnik?.ime}</td>
               </tr>
                   
              <tr>
               <th>Prezime</th>
                <td>{this.state.korisnik?.prezime}</td>
               </tr>
              <tr>
                <th>JMBG</th>
                <td>{this.state.korisnik?.jmbg}</td>
              </tr>
              <tr>
                <th>Broj lične karte</th>
                <td>{this.state.korisnik?.br_licne_karte}</td>
            </tr>
            <tr>
                <th>Adresa prebivališta</th>
                <td>{this.state.korisnik?.ulica_prebivalista} {this.state.korisnik?.broj_prebivalista}, {this.state.korisnik?.mesto_prebivalista}</td>
            </tr>
            <tr>
                <th>Broj telefona</th>
                <td>{this.state.korisnik?.br_telefon}</td>
            </tr>
            <tr>
                <th>E-mail</th>
                <td>{this.state.korisnik?.email}</td>
            </tr>
            <tr>
                <th>Sifra</th>
                <td><Link to="/izmenaSifre">Izmenite šifru</Link></td>
            </tr>
            </tbody>
          </Table>
          
          </Container>  
        )    
    }
}