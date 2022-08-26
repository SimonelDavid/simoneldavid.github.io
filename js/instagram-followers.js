const baseUrl = 'https://www.instagram.com/david.simonel_7/'
let followers = []

function toQs(obj) {
  return Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

function request (url, options) {
  options = options || {}
  options = {
    ...options,
    credentials: "same-origin"
  }

  return fetch(options, url)
    .then(response => { return response.json()})
} 

function getFollowers(params) {
  let url = baseUrl + 'query/?'
  let newParams = {
    ...params,
    variables: JSON.stringify(params.variables)
  }

  request(url + toQs(newParams)).then(data => {
    console.log('data', data)
    const nextCursor = data.data.user.edge_followed_by.page_info.end_cursor
    const edges = data.data.user.edge_followed_by.edges
    
    followers = followers.concat(edges)

    if (nextCursor) {
      console.log('has next page')
      params = {
        ...params,
        variables: {
          ...params.variables,
          after: nextCursor
        }
      }
      getFollowers(params)
    } else {

      let rows = [
        ['username']
      ]

      followers.forEach(follower => {
        rows.push([follower.node.username])
      })

      toCsv('followers', rows)
    }
  })
}

function toCsv(filename, rows) {
  let processRow = function (row) {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      };
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0)
        result = '"' + result + '"';
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '';
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

  if (navigator.msSaveBlob) { 
    navigator.msSaveBlob(blob, filename);
  } else {
    let link = document.createElement("a");
    if (link.download !== undefined) {
      let url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

const params = {
  query_hash: '37479f2b8209594dde7facb0d904896a',
  variables: {
    id: "2349248451",
    first: 1000
  }
}

getFollowers(params)