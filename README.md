# World Video Guide

**World Video Guide** è un'applicazione web interattiva progettata per esplorare e scoprire contenuti video da tutto il mondo. Attraverso una mappa globale, gli utenti possono navigare tra le nazioni, visualizzare video suggeriti dalla community e partecipare a discussioni. Il progetto è stato sviluppato con un'architettura moderna e tecnologie all'avanguardia, ponendo un forte accento sull'esperienza utente, la reattività e la scalabilità.

L'applicazione è concepita come una **Progressive Web App (PWA)**, garantendo un'esperienza nativa su dispositivi mobili, funzionalità offline e notifiche push per un coinvolgimento continuo.

## Sito Online

Il sito è attualmente online grazie a **Firebase Hosting** e puoi provarlo al seguente link: [https://prova-mappa-f1d90.web.app/](https://prova-mappa-f1d90.web.app/).

## Architettura e Stack Tecnologico

Il progetto si basa su un'architettura client-server disaccoppiata, con un frontend reattivo e un backend serverless robusto.

### Frontend

*   **React 19**: Utilizzato per costruire un'interfaccia utente dinamica e component-based. L'uso di React Hooks (come `useState`, `useEffect`, `useRef`) permette una gestione dello stato e del ciclo di vita dei componenti pulita ed efficiente.
*   **TypeScript**: Garantisce un codice robusto, manutenibile e con type-safety, riducendo i bug in fase di sviluppo.
*   **Vite**: Un build tool di nuova generazione che offre un'esperienza di sviluppo estremamente rapida grazie al suo server di sviluppo nativo ESM e al bundling ottimizzato per la produzione.
*   **Tailwind CSS**: Un framework CSS utility-first che permette di creare design complessi e reattivi direttamente nell'HTML, garantendo coerenza stilistica e rapidità di sviluppo.
*   **Framer Motion**: Una libreria di animazione per React che consente di creare animazioni fluide e complesse con un'API dichiarativa e intuitiva.
*   **React Router**: Per la gestione del routing lato client, permettendo una navigazione fluida tra le diverse sezioni dell'applicazione (Home, Profilo, Admin).
*   **Vite PWA Plugin**: Per trasformare l'applicazione in una Progressive Web App, gestendo il service worker, la cache e il manifest dell'app.

### Backend & Servizi

* **Firebase**: Una piattaforma completa di Google che fornisce i seguenti servizi:
  * **Firestore**: Un database NoSQL flessibile e scalabile utilizzato per memorizzare tutti i dati dell'applicazione, come utenti, video, commenti, categorie e segnalazioni. Le query in tempo reale garantiscono che l'interfaccia utente sia sempre sincronizzata con il database.
  * **Firebase Authentication**: Gestisce l'autenticazione degli utenti tramite provider multipli (Google, GitHub, Email/Password) in modo sicuro e scalabile.
  * **Firebase Cloud Messaging**: Utilizzato per inviare notifiche push multi-dispositivo, permettendo agli utenti di rimanere aggiornati sui nuovi video nei paesi che seguono.
* **Backend Node.js/Express**: Un servizio backend dedicato (ospitato su Render/locale) che gestisce la logica di iscrizione e l'invio protetto delle notifiche push, interfacciandosi con le API di Firebase Admin.

## Feature Principali

L'applicazione offre un'ampia gamma di funzionalità pensate per la community e gli amministratori.

### Per gli Utenti

*   **Esplorazione Globale**: Una mappa del mondo interattiva (`@vnedyalk0v/react19-simple-maps`) permette di selezionare i paesi e visualizzare i video associati.
*   **Autenticazione Multi-Provider**: Login semplice e sicuro tramite Google, GitHub o credenziali email/password.
*   **Suggerimento di Video**: Gli utenti autenticati possono suggerire nuovi video per ogni paese, che verranno poi sottoposti a revisione.
*   **Chat per Paese**: Ogni nazione ha una chat dedicata dove gli utenti possono discutere e scambiarsi opinioni.
*   **Notifiche Push**: Gli utenti possono iscriversi alle notifiche per i loro paesi preferiti e ricevere un avviso quando un nuovo video viene approvato. Il sistema supporta notifiche su più dispositivi per lo stesso utente.
*   **Profilo Utente**: Una pagina personale dove gli utenti possono visualizzare le statistiche sui video suggeriti (in attesa, approvati, rifiutati) e gestire i paesi seguiti.
*   **Segnalazione di Contenuti**: Possibilità di segnalare commenti e video inappropriati per la revisione da parte dei moderatori.
*   **PWA (Progressive Web App)**: L'applicazione è installabile sulla home screen dei dispositivi mobili e offre un' ottima esperienza offline.

### Per gli Amministratori

*   **Pannello di Amministrazione**: Un'area riservata per moderatori e amministratori con strumenti per la gestione dei contenuti.
*   **Revisione dei Video**: Un'interfaccia per approvare o rifiutare i video suggeriti dagli utenti. In caso di rifiuto, è possibile specificare una motivazione.
*   **Gestione Dinamica delle Categorie**:
    *   Gli amministratori possono modificare le categorie associate a un video prima di approvarlo.
    *   Se una categoria non esiste, viene creata dinamicamente al momento dell'approvazione del video.
    *   **Gestione degli Alias**: È possibile unire categorie "grezze" (es. "cucina tipica") a categorie ufficiali (es. "cibo") creando un alias. I futuri suggerimenti con lo stesso nome verranno automaticamente associati alla categoria corretta.
*   **Gestione delle Segnalazioni**: Liste separate per visualizzare e gestire i commenti e i video segnalati dagli utenti.
*   **Gestione Utenti**: Visualizzazione di tutti gli utenti registrati con la possibilità di modificarne il ruolo (user, moderator, admin).

## Istruzioni per l'Avvio Locale

Il progetto include sia la User Interface (Frontend) che le API (Backend) all'interno dello stesso repository. Il frontend si trova nella root principale, mentre il servizio backend per le notifiche risiede nella cartella `/backend`.

Segui questi passaggi per avviare l'intero ambiente di sviluppo:

1. **Clona il repository:**

   ```bash
   git clone https://github.com/DaPrato4/world-video-guide
   cd world-video-guide
   ```

2. **Configura le variabili d'ambiente (.env):**
   Crea un file `.env.local` nella root del progetto (dove si trova React).

   ```env
   # Configurazione Frontend (React/Firebase)
   VITE_FIREBASE_API_KEY="YOUR_API_KEY"
   VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
   VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
   VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
   VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
   VITE_FIREBASE_APP_ID="YOUR_APP_ID"
   VITE_FIREBASE_VAPID_KEY="YOUR_VAPID_KEY_FOR_FCM"
   ```

3. **Avvia il Backend (API):**
   Apri un terminale e avvia il server Node.js:

   ```bash
   cd backend
   npm install
   node index.js
   ```

4. **Avvia il Frontend (UI):**
   Apri un nuovo terminale, assicurati di essere nella root del progetto (world-video-guide) e avvia React:

   ```bash
   npm install
   npm run dev
   ```

L'applicazione sarà ora disponibile all'indirizzo [http://localhost:5173](http://localhost:5173).

Questo progetto rappresenta una dimostrazione completa di come integrare diverse tecnologie moderne per creare un'applicazione web ricca di funzionalità, scalabile e manutenibile.
