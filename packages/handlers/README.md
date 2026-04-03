# `@lucas-pmelo/lambda-handlers`

Essa biblioteca fornece um handler para facilitar o manejo de apis lambda

## Usage

```typescript
import {
  Controller,
  Request,
  Response,
  ApiHandler,
} from "@lucas-pmelo/lambda-handlers";

interface User {
  id: string;
  name: string;
}

const getUserController: Controller<User> = async (
  request: Request
): Promise<Response<User>> => {
  const user = await getUser(request.params.id);

  return {
    body: user,
    statusCode: 200,
  };
};

const apiHandler = new ApiHandler(getUserController);

export const handler = async (req, res) => {
  return apiHandler.handler(req, res);
};
```
