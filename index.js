const path = require("path");
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config({ path: path.join(__dirname, '.env')});

const app = express();

app.use(cors());
app.use(express.json());

const LINK_DO_BANCO = process.env.MONGO_URI;

mongoose.connect(LINK_DO_BANCO)
    .then(function() {
        console.log("Conectado com sucesso ao Mongo na nuvem!");
    })
    .catch(function(erro){
        console.log("Erro ao conectar ao MongoDB:", erro);
    });

 const UsuarioSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    cargo: {type: String, required: true}
 });

 const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Nossa lista de usuários na memória
let usuarios = [
    { nome: "Ana Costa", cargo: "Desenvolvedora" },
    { nome: "Carlos Souza", cargo: "Designer" }
];

// [GET] Listar todos
app.get('/usuarios', function (requisicao, response) {
    Usuario.find()
      .then(function(listaUsuarios){
        return response.json(listaUsuarios)
      })
      .catch(function(erro){
        return response.status(500).json({erro: "Erro ao buscar o banco de dados", erro})
      });
});

// [POST] Criar um novo
app.post('/usuarios', function (requisicao, response) {
    const dadosRecebidos = requisicao.body;
    Usuario.create({
        nome: dadosRecebidos.nome,
        cargo: dadosRecebidos.cargo
    })
        .then(function(novoUsuario){
            return response.status(201).json(novoUsuario);
        })
        .catch(function(erro){
            return response.status(400).json({erro: "Erro ao salvar o usuário no banco de dados"})
        })
       
    
});

// [PUT] Atualizar pelo Nome
// Rota para o recebimento do parametro de texto
app.put('/usuarios/:nomeParametro', function (requisicao, response) {
    // decodeURIComponent limpa os espaços e caracteres da URL (ex: "Ana%20Costa" vira "Ana Costa")
    const nomeParametro = decodeURIComponent(requisicao.params.nomeParametro);
    const dadosNovos = requisicao.body;
    // Procura o usuário na lista ignorando letras maiúsculas ou minúsculas
    Usuario.findOneAndUpdate(
        {nome: {$regex: new RegExp("^" + nomeParametro + "$", "i")}},
        {nome: dadosNovos.nome, cargo: dadosNovos.cargo},
        {new: true}
    )
    // Se o usuário não for encontrado no array, retorna o erro 404 explicitamente
     .then(function(usuarioAtualizado){
        if(!usuarioAtualizado) {
        return response.status(404).json({erro: "Usuário não encontrado para atualizar"})
        }
        return response.json(usuarioAtualizado);
     })
     .catch(function(erro){
        return response.status(500).json({erro: "Erro ao processar atualização no banco"});
     })
});


// [DELETE] Remover pelo Nome
app.delete('/usuarios/:nomeParametro', function (requisicao, response) {
    const nomeParametro = decodeURIComponent(requisicao.params.nomeParametro);
    
    Usuario.findOneAndDelete(
        {nome: {$regex: new RegExp("^" + nomeParametro + "$", "i")}},
        {nome: dadosNovos.nome, cargo: dadosNovos.cargo},
        {new: true}
    )
    .then(function(usuarioDeletado){
        if(!usuarioDeletado) {
            return response.status(404).json({erro: "Usuário não encontrado para exclusão"})
        }
        return response.json(usuarioDeletado);
    })
    .catch(function(erro){
        return response.status(500).json({erro: "Erro ao processar exclusão do usuário"})
    })
    //const listaFiltrada = usuarios.filter(function (u) {
        //return u.nome.toLowerCase() !== nomeParametro.toLowerCase();
    //});

    //if (listaFiltrada.length === usuarios.length) {
        //return response.status(404).json({ erro: "Usuário não encontrado" });
    //}

    //usuarios = listaFiltrada;
    //return response.status(204).send();
});

const PORTA = 3000;
app.listen(PORTA, function () {
    console.log(`🚀 Backend (Ajustado) rodando em http://localhost:${PORTA}`);
});