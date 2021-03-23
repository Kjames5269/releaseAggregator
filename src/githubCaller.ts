import axios, { AxiosBasicCredentials } from 'axios';
import { Promise } from 'es6-promise';

interface GithubReleaseData {
  url: string;
  html_url: string;
  tag_name: string;
  body: string;
}

interface GithubRelease {
  data: GithubReleaseData[];
  pages: number;
}

const PER_PAGE = 100;

interface GithubCredentials extends AxiosBasicCredentials { }

const findFinalPage = (link: string): number => {
  const last = link.split(",").filter(e => e.indexOf("last") !== -1)[0];
  if(last === undefined)
    return 0;
  const lastNumber = last.substring(last.indexOf("page="), last.indexOf(">")).split("=")[1];
  return parseInt(lastNumber);
};

const getRelease = (credentials: GithubCredentials, owner: string, repo: string): Promise<GithubReleaseData[]> => {
  return new Promise(resolve => {
    getReleaseHelper(credentials, owner, repo, 0, 0).then(data => {
      const promiseArray = [];
      for (let i = 0; i < data.pages; i++) {
        promiseArray.push(getReleaseHelper(credentials, owner, repo, i));
      }
      Promise.all(promiseArray).then(data2 => resolve(data2.flatMap(e => e.data)));
    });
  });
};

const getReleaseHelper = (credentials: GithubCredentials, owner: string, repo: string, page: number, perPage = PER_PAGE): Promise<GithubRelease> => {
  // @ts-ignore
  return axios.get<GithubReleaseData[]>(`https://api.github.com/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`, {
    auth: credentials
  })
    .then(data => new Promise<GithubRelease>(resolve => {
      resolve({
        data: data.data,
        pages: data.headers.link ? findFinalPage(data.headers.link) : 0
      })
    }))
    .catch((e) => {
      console.error(`Error calling github API: ${e}`);
      return new Promise<GithubRelease>(resolve => resolve({ pages: 0, data: [] }))
    });
};

export default getRelease;
