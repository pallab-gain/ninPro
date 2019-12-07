import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button
} from 'react-native';

/**
 * Minimum styling
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  h2text: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatview: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  value: {
    fontSize: 14
  }
});

// proxy server url
const serverURL = 'https://ninproxy.herokuapp.com/nin/info';
/**
 * Modified fetch API with timeout. default value is 5 second
 * @param {string} url
 * @param {number} timeout
 */
const ninFetch = async (url, timeout = 5000)=> {
    return Promise.race([
        fetch(url, {method: 'GET'}),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
}

const App = () => {
  const [serverTime, setServerTime] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [inProgress, setInProgress] = useState(false);

  /**
   * Fetch server time and log from the proxy server and update the state
   */
  const fetchData = async ()=> {
    setInProgress(true);
    try{
      const response = await ninFetch(serverURL)
      .then( response => response.json() );
      const logs = response.auditLogs.map( (value, index) => {
        return {index:`${index}`, value};
      })
      setAuditLogs(logs || []);
      setServerTime(response.timeInSec);
    } catch(err){
      //console.error(err);
    }
    setInProgress(false);
  }

  /**
   * On load hook that will fetch server time and logs on load
   */
  useEffect(() => {
    let isRunning = false;
    const intervalId = setInterval(async ()=> {
      if(!isRunning){
        isRunning = true;
        await fetchData();
        isRunning = false;
      }
    }, 3000);

    return ()=>{
      clearInterval(intervalId);
    }

  }, []);

  return (
    <View style={styles.container} >
        <Text style={styles.h2text}>
          {`Server Time : ${serverTime}`}
        </Text>
          <FlatList
            data={auditLogs}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) =>
            <View style={styles.flatview}>
              <Text style={styles.value}>{item.value}</Text>
            </View>
            }
            keyExtractor={item => item.index}
        />
        <Button
          title="Sync Server Time!"
          disabled={inProgress}
          onPress={() => fetchData()}
        />
      </View>
  )
}

export default App;

