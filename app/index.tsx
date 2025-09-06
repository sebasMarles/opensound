import { View, Text, StyleSheet } from 'react-native'

const index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to OpenSound!</Text>
      <Text style={styles.subtitle}>Enjoy exploring music and sounds.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
  },
})

export default index