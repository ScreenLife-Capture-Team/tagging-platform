import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";
import authentication, {
  AuthenticationClient,
} from "@feathersjs/authentication-client";
import { createClient, ServiceTypes } from "screenlife-platform-server";
import {
  AuthenticationRequest,
  AuthenticationResult,
} from "@feathersjs/authentication/lib";
import { Params, Query } from "@feathersjs/feathers";
import axios from "axios";

// @ts-ignore
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3030";
if (!API_BASE_URL) console.error("API_BASE_URL EMPTY");
console.log("API_BASE_URL:", API_BASE_URL);

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;
console.log("APP_ENV:", APP_ENV);

export const socket = io(API_BASE_URL, {
  forceNew: true,
  autoConnect: !!API_BASE_URL, // don't connect during testing
});

const logoutClient = () => {
  localStorage.removeItem("user_id");
  localStorage.removeItem("refresh_token");
  app.authentication.removeAccessToken();
  console.log("auth:logoutClient");
  window.location.href = "/login";
};

const attemptRefetchAccessToken = async () => {
  const _id = localStorage.getItem("user_id");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!_id || !refreshToken) {
    logoutClient();

    return false;
  }

  let res;
  try {
    res = await axios.post(`${API_BASE_URL}/refresh-tokens`, {
      _id,
      refreshToken,
    });
  } catch (err) {
    logoutClient();

    return false;
  }

  if (res.data.accessToken) {
    // if successfully refreshed an access token, set it and reauthenticate
    await app.authentication.setAccessToken(res.data.accessToken);
    await app.reAuthenticate(true);

    return true;
  } else {
    // if failed, consider the refresh token expired
    logoutClient();

    return false;
  }
};

const socketClient = socketio<ServiceTypes>(socket);
const app = createClient(socketClient);
app.hooks({
  before: {
    all: [],
  },
  error: {
    all: [
      async (context) => {
        if (
          context.error.message === "jwt expired" ||
          context.error.message === "Not authenticated"
        ) {
          await attemptRefetchAccessToken();
        }

        return context;
      },
    ],
  },
});

class CustomAuthClient extends AuthenticationClient {
  async authenticate(
    authentication?: AuthenticationRequest | undefined,
    params?: Params<Query> | undefined
  ): Promise<AuthenticationResult> {
    const res = await super.authenticate(authentication, params);
    localStorage.setItem("user_id", res.user?._id?.toString());
    localStorage.setItem("refresh_token", res.refreshToken);

    return res;
  }
}

app.configure(
  authentication({
    Authentication: CustomAuthClient,
  })
);

// TODO: Add actions on server-side changes
// app.service('users').on('created', () => {
//   queryClient.invalidateQueries(['users'])
// })

// TODO: Declare usage of custom methods here
app.use("imageTags", socketClient.service("imageTags"), {
  methods: [
    "create",
    "find",
    "get",
    "remove",
    "patch",
    "tagImages",
    "autoTagImages",
  ],
});

app.use("images", socketClient.service("images"), {
  methods: ["get", "find", "autoTag"],
});
// app.use('entities', socketClient.service('entities'), {
//   methods: []
// })
// app.use('users/verification', socketClient.service('users/verification'), {
//   methods: ['request', 'resetPassword', 'verify']
// })
// app.use('users', socketClient.service('users'), {
//   methods: ['sendTestEmail', 'sendTestNotification', 'generateTelegramOTP']
// })

// app.use('reports', socketClient.service('reports'), {
//   methods: ['getGeneratedPdfUrl']
// })

export { app };
