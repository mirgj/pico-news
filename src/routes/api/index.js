import { Router } from 'express';
import { ApiError, UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError } from '../../results/api-errors';
import { Errors, HttpStatus } from '../../constants/index';
import { logger } from '../../helpers/logger';
import validation from 'express-validation';
import storiesRoutes from './stories';
import usersRoutes from './users';
import commentsRoutes from './comments';

const router = Router();

router.use('/stories', storiesRoutes);
router.use('/users', usersRoutes);
router.use('/comments', commentsRoutes);
router.use('/', (req, res, next) =>
  res.status(HttpStatus.NOT_FOUND).send(new NotFoundError(Errors.API_NOT_FOUND))
);
router.use((err, req, res, next) => {
  logger.error(`API call error: ${JSON.stringify(err)}`);

  if (err instanceof validation.ValidationError) {
    const messages = err.errors.map(error => error.messages.join('. ')).join(' and ');
    return res.status(HttpStatus.BAD_REQUEST).send(new BadRequestError(messages, err.errors));
  }
  if (err instanceof SyntaxError)
    return res.status(HttpStatus.BAD_REQUEST).send(new BadRequestError(Errors.BAD_REQUEST_ERROR));
  if (err instanceof BadRequestError)
    return res.status(HttpStatus.BAD_REQUEST).send(err);
  if (err instanceof UnauthorizedError)
    return res.status(HttpStatus.UNAUTHORIZED).send(err);
  if (err instanceof NotFoundError)
    return res.status(HttpStatus.NOT_FOUND).send(err);
  if (err instanceof ForbiddenError)
    return res.status(HttpStatus.FORBIDDEN).send(err);
  if (err instanceof ApiError)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);


  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(new ApiError(Errors.INTERNAL_ERROR));
});

export default router;
