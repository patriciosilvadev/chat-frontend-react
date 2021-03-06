import React, { Component, Fragment } from 'react'
import moment from 'moment'
import Pusher from 'pusher-js'

import { obterMensagensSala, enviarNovaMensagem, setStatusUsuario } from '../services/api'
import InputChat from '../common/chat/InputChat';
import Conversa from '../common/chat/Conversa';
import Avatar from '../common/template/Avatar'

const MensagemSalaContext = React.createContext({
    mensagens: null,
    msg: null,
    enviarMensagem: msg => { }
})

class MensagemSala extends Component {

    state = {
        msg: null,
        mensagens: [],
        totalMensagensSala: 0,
        usuarioTmp: ''
    }

    fecharSessaoUsuario = () => {

        setStatusUsuario(this.state.usuarioTmp, 0)
      
    }

    setupBeforeUnloadListener = () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            return this.fecharSessaoUsuario();
        });
    };

    componentWillReceiveProps(props, state) {
        this.obterMensagensSala(props.sala)
    }

    componentDidMount(props) {

        const { usuario } = this.props
        this.setState({usuarioTmp: usuario})

        setStatusUsuario(usuario, 1)

        this.setupBeforeUnloadListener();

        const pusher = new Pusher('6729210a0326f10db4a4', {
            cluster: 'us2',
            forceTLS: true
        });
      
        const channel = pusher.subscribe('chat');
        channel.bind('message', data => {
            this.setState({
                totalMensagensSala: this.state.totalMensagensSala + 1,
                mensagens:  [...this.state.mensagens, data]
            })
        });
      
    }

    enviarMensagem = async (mensagem) => {

        const { sala, usuario } = this.props

        const objMensagem = {
            id_usuario: usuario.id,
            nome: usuario.nome,
            nickname: usuario.nickname,
            id_sala: sala.id,
            texto: mensagem,
            data_envio: moment().format(),
        }

        await enviarNovaMensagem(objMensagem).then(response => {
            return response
        })

    }

    obterMensagensSala = async (sala) => {

        const response = await obterMensagensSala(sala).then(response => {
            return response
        })
        this.setState({ totalMensagensSala: response.data.length })
        this.setState({ mensagens: response.data })

    }

    render() {

        const { enviarMensagem } = this

        const value = {
            ...this.state,
            enviarMensagem
        }
        return (
            <MensagemSalaContext.Provider value={value}>
                <MensagemSalaContext.Consumer>
                    {
                        ({ textoMensagem, mensagens }) => (
                            <Fragment>

                                <div className="col-md-8 col-xl-6 chat">
                                    <div className="card">
                                        <div className="card-header msg_head">
                                            <div className="d-flex bd-highlight">
                                                <div className="img_cont">
                                                    <Avatar nome_avatar={this.props.sala.nome_sala} rounded={true} size="60" />

                                                </div>
                                                <div className="user_info">
                                                    <span>Chat na sala {this.props.sala.nome_sala} </span>
                                                    <p>{this.state.totalMensagensSala} Mensagens</p>
                                                </div>
                                                <div className="video_cam">
                                                    <span><i className="fas fa-video"></i></span>
                                                    <span><i className="fas fa-phone"></i></span>
                                                </div>
                                            </div>
                                            <span id="action_menu_btn"><i className="fas fa-ellipsis-v"></i></span>

                                        </div>

                                        <Conversa {...{ mensagens }} />
                                        <InputChat {...{ enviarMensagem }} />
                                    </div>
                                </div>
                            </Fragment>
                        )
                    }
                </MensagemSalaContext.Consumer>
            </MensagemSalaContext.Provider>

        )
    }
}

export default MensagemSala