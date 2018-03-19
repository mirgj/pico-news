import http from 'http';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import flash from 'connect-flash';
import moment from 'moment';
import apiRoutes from './routes/api/index';
import viewRoutes from './routes/view/index';
import config from '../config';
import { connect } from './db/connector';

const app = express();

(async(app) => {
  try {
    await connect(config.connectionString);

    app.server = http.createServer(app);
    app.locals.moment = moment;
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, '/views'));
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compress());
    app.use(helmet());
    app.use(cors());
    app.use(session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: '/',
        httpOnly: true,
      },
    }));
    app.use(flash());
    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError) {
        // todo: send API Error
      }
      else if (err) {
        next(err);
      }

      flash(req, res, next);
    });
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', apiRoutes);
    app.use('/', viewRoutes);

    if (!module.parent) {
      app.server.listen(config.port, () => {
        console.log(`Application started on port ${app.server.address().port}`);
      });
    }
  }
  catch (err) {
    console.error(err);
  }
})(app);

export default app;
