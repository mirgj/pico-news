export const Errors = {
  DB_ERROR: 'DB not connected',
  INTERNAL_ERROR: 'Internal Server Error',
  API_NOT_FOUND: 'API method not found',
  BAD_REQUEST_ERROR: 'Malformed data. Check your input',
  STORY_NOT_FOUND: 'Story not found. Check the storyId and try again',
  CREATE_STORY_ERROR: 'Error creating the story, check if all the required fields are provided',
  USERNAME_NOT_FOUND: 'User not found. Check your username',
  USER_NOT_FOUND: 'User not found',
  CREATE_USER_ERROR: 'Error creating the user',
  CREATE_USER_USERNAME_ERROR: 'Error creating the user. Username may be already used.',
  UPDATE_USER_ERROR: 'Error updating the user, try again',
};

export const Infos = {
  CREATE_STORY_INFO: 'Story has been created',
  CREATE_USER_INFO: 'User has been created',
  UPDATE_USER_INFO: 'User has been updated',
};

export const ErrorsCode = {
  API_ERROR: 'API Error',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',
  BAD_REQUEST: 'Bad Request',
};

export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const Collections = {
  Users: 'users',
  Stories: 'stories',
  Comments: 'comments',
};
