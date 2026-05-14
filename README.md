# Prodesp---A
---
# 🚀 Guia Prático de Git

Este README serve como um guia rápido para as operações fundamentais do Git: criar ramificações, registar alterações e publicar o código.
--- 

## 📋 Fluxo de Trabalho 

O fluxo padrão para trabalhar numa funcionalidade ou correção consiste em quatro passos principais:

### 1. Criar e Mudar de Branch
Para manter o código principal (`main` ou `master`) estável, deve sempre trabalhar numa ramificação separada.

* **Criar e entrar numa nova branch:**
    ```bash
    git checkout -b nome-da-minha-branch
    ```
    *Dica: O prefixo `-b` cria a branch e muda para ela automaticamente.*

---

### 2. Preparar as Alterações (Add)
Após editar os seus ficheiros, precisa de dizer ao Git quais as mudanças que devem ser incluídas no próximo "ponto de salvamento".

* **Adicionar um ficheiro específico:**
    ```bash
    git add nome-do-ficheiro.js
    ```
* **Adicionar todas as alterações de uma vez:**
    ```bash
    git add .
    ```

---

### 3. Registar as Alterações (Commit)
O commit grava as suas alterações localmente com uma mensagem descritiva.

* **Criar o commit:**
    ```bash
    git commit -m "Descrição clara do que foi alterado"
    ```

---

### 4. Enviar para o Servidor (Push)
Este passo envia o seu trabalho local para o repositório remoto (ex: GitHub ou GitLab).

* **Primeiro envio da branch (configura o upstream):**
    ```bash
    git push -u origin nome-da-minha-branch
    ```
* **Envios subsequentes (na mesma branch):**
    ```bash
    git push
    ```

---

## 🔍 Comandos de Verificação Úteis

* **Verificar o estado atual (ficheiros modificados):** `git status`
* **Listar todas as branches:** `git branch`
* **Ver o histórico de commits:** `git log --oneline`
