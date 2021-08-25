import axios from "axios";

type searchDevParams = {
  username?: string;
  language?: string;
  location?: string;
  token?: string;
}

type followingDevsParams = {
  login: string;
  page?: number;
  per_page?: number;
  token?: string;
  getAll?: boolean;
}

type isFollowingBackParams = {
  login: string;
  loginOfFollowed: string;
  page?: number;
  per_page?: number;
  token?: string;
  getAll?: boolean;
}

export const api = axios.create({
  baseURL: "https://api.github.com",
});

export const searchDevs = async ({ username, language, location, token }: searchDevParams) => {
  var query = "";

  username.includes("@")
    ? query = query + `${username.substring(1).trim()} in:login`
    : query = query + `${username.trim()} in:name `;

  if (location) {
    query = query + `location:${location.trim()} `;
  }

  if (language) {
    query = query + `language:${language.trim()} `;
  }

  const result = await api.get(`search/users`, {
    headers: {
      Authorization: `${token ? `token ${token}` : ''}`,
    },
    params: {
      q: query,
    },
  });

  return result;
}

export const followingDevs = async ({ login, page, per_page, token, getAll }: followingDevsParams) => {
  const indexOfPage = page ? page : 1;
  const numberPerPage = per_page ? per_page : 100;

  var stopCondition = false;
  var accumalator = 0;

  const request = async () => await api.get(`users/${login}/following`, {
    headers: {
      Authorization: `${token ? `token ${token}` : ''}`,
    },
    params: {
      page: indexOfPage + accumalator,
      per_page: numberPerPage
    },
  });

  const followingDevs = [];

  if(getAll) {
    while(stopCondition === false) {
      const devs = await request();

      if(devs?.data?.length === 0) {
        stopCondition = true;
        break;
      }

      followingDevs.push(...devs.data);

      accumalator++;
    }
  } else {
    const devs = await request();
    followingDevs.push(...devs.data);
  }

  return followingDevs;
}

export const isFollowingBack = async ({ login, loginOfFollowed, page, per_page, token, getAll }: isFollowingBackParams) => {
  const followingDevsList = followingDevs({ login: loginOfFollowed, page, per_page, token, getAll });

  var isFollowed = false;
  (await followingDevsList).map(async (dev) => {
    if(dev.contains(login)) {
      isFollowed = true;
    };
  });

  return isFollowed;
}
