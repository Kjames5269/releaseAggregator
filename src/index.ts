import getReleases from './githubCaller';
import compareVersions = require('compare-versions');
const fs = require('fs');
const open = require('open');

const FILE_NAME = `${process.argv[1].split('/').reverse().splice(1).reverse().join("/")}/index.md`;
const SECRET_FILE = `${process.argv[1].split('/').reverse().splice(2).reverse().join("/")}/secret.json`;

const args = process.argv.splice(2);

if (args.length !== 3) {
  console.error("> owner/repo versionFrom versionTo");
  console.error("> microsoft/TypeScript 4.2.2 4.2.3");
  process.exit(1);
}

const org = args[0].split("/")[0];
const repo = args[0].split("/")[1];
const lower = args[1];
const upper = args[2];

interface Auth {
  username: string;
  password: string;
}

if(!fs.existsSync(SECRET_FILE)) {
  console.error(`${SECRET_FILE} does not exist! See the Readme!`);
  process.exit(1);
}

const auth: Auth = JSON.parse(fs.readFileSync(SECRET_FILE));

if(!auth.password && !auth.username) {
  console.error("Your secret file does not include a username or password. See the Readme!");
  process.exit(1);
}

getReleases(auth, org, repo).then(data => {
  const between = data.filter(e =>
      compareVersions.validate(e.tag_name)
        && compareVersions(e.tag_name, lower) === 1
        && compareVersions(e.tag_name, upper) !== 1
  );
  const map = between.reduce((previousValue, currentValue) =>
      ({ ...previousValue, [currentValue.tag_name]: currentValue.body }), {} as { [key: string]: string });

  fs.writeFileSync(FILE_NAME, "");

  Object.keys(map)
  .map(e => ({
    tag_name: e,
    body: map[e],
  }))
  .sort(((e ,f) => compareVersions(e.tag_name, f.tag_name)))
  .forEach((e, i, arr) => {
    fs.appendFileSync(FILE_NAME, `${e.body}${i !== arr.length -1 ? '\n<br />~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~<br />' : ''}`);
  });

  open(FILE_NAME);
});


