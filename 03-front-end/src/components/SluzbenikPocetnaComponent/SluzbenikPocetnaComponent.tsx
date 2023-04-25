import BasePage from "../BasePage/BasePage";
import { Container, Table } from 'react-bootstrap';
import { Link, Redirect } from "react-router-dom";
import "./sluzbenikPocetnaComponent.css"
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from "../../Api/EventRegister";
import getLocationAndIp from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import SluzbenikModel from "../../../../03-back-end/src/components/sluzbenik/model";
import SluzbenikService from "../../services/SluzbenikService";

class SluzbenikPocetnaComponentState {
    isUlogovan: boolean | null;
    sluzbenik: SluzbenikModel | null;
}

export default class SluzbenikPocetnaComponent extends BasePage<{}> {
    state: SluzbenikPocetnaComponentState;

    constructor(props: any) {
        super(props);

        this.state = {
            isUlogovan: null,
            sluzbenik: null
        }
    }

    private getSluzbenik() {
        SluzbenikService.getSluzbenik()
        .then(res => {
            this.setState({
                sluzbenik: res
            })
        })
    }

   
    componentDidMount(): void {
        isUlogaUlogovana("sluzbenik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login");
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
            }
        }) 

        this.getSluzbenik();        
        addAktivnost(window.location.href, "Službenik početna.", "sluzbenik");
    }

    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }
        return (
            <Container className="sluzbenikPocetna">
                <h2>Uspešno ste se ulogovali kao službenik:</h2>
                 <Table className="tabela" striped bordered hover>
                        <tr>
                            <th>Ime</th>
                            <td>{this.state.sluzbenik?.ime}</td>
                        </tr>
                        <tr>    
                            <th>Prezime</th>
                            <td>{this.state.sluzbenik?.prezime}</td>
                        </tr>    
                        <tr>
                            <th>Email</th>
                            <td>{this.state.sluzbenik?.email}</td>
                        </tr>
                        <tr>   
                            <th>Službeni broj telefona</th>
                            <td>{this.state.sluzbenik?.br_telefona_sluzbeni}</td>
                        </tr>     
                </Table>         
            </Container>     
        )
    }

}