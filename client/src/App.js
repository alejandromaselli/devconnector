import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Landing from './components/layout/Landing';
import NavBar from './components/layout/NavBar';

import Login from './auth/Login';
import Register from './auth/Register';

import './App.css';

const App = () => (
    <Router>
        <>
            <NavBar />
            <Route exact path='/' component={Landing} />
            <section className="container">
                <Switch>
                    <Route exact path='/login' component={Login} />
                    <Route exact path='/register' component={Register} />
                </Switch>
            </section>
        </>
    </Router>
);

export default App;
