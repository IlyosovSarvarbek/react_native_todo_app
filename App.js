import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const Task = ({ task, onComplete, onDelete }) => {
  return (
    <View style={[styles.task, task.completed && styles.completed]}>
      <TouchableOpacity style={styles.taskLeft} onPress={() => onComplete(task.id)}>
        <Image style={styles.img} source={task.completed ? require('./assets/tick.png') : require('./assets/not_tick.png')} />
        <Text style={[styles.taskText, task.completed && styles.completedText]}>{task.text}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Image style={styles.img} source={require('./assets/delete.png')} />
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const scrollViewRef = useRef(null); 
  const [isNewTask, setIsNewTask] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (isNewTask && tasks.length > 0 && atBottom && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
      setIsNewTask(false);
    }
  }, [tasks, isNewTask, atBottom]);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks !== null) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
      setTasks(tasksToSave);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const handleAddTask = () => {
    if (taskText.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
      };
      const updatedTasks = [newTask, ...tasks];
      saveTasks(updatedTasks);
      setTaskText('');
      setIsNewTask(true); 
    }
  };

  const handleCompleteTask = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const handleScroll = (contentWidth, contentHeight, layoutWidth, layoutHeight, contentOffsetX, contentOffsetY) => {
    const isAtBottom = contentHeight - layoutHeight === contentOffsetY;
    setAtBottom(isAtBottom);
  };

  return (
    <View style={styles.container}>
      <StatusBar style='auto'/>
      <View style={styles.taskWrapper}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>

        {/* ScrollView to make tasks scrollable */}
        <ScrollView 
          style={styles.items} 
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={handleScroll} 
        >
          {tasks.length === 0 ? (
            <Text style={styles.noTasksText}>You don't have any tasks yet.</Text>
          ) : (
            tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.writeTaskWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Add tasks here..."
          value={taskText}
          onChangeText={setTaskText}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },

  taskWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  items: {
    marginTop: 20,
    paddingBottom: 100,
  },

  task: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  completed: {
    backgroundColor: "#D3F9D8",
  },

  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  taskText: {
    fontSize: 16,
    marginLeft: 10,
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },

  img: {
    width: 30,
    height: 30,
    margin: 10,
    objectFit: "cover",
    resizeMode:"contain"
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  writeTaskWrapper: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 60,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
  },

  addButton: {
    height: 50,
    width: 90,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  noTasksText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
    marginTop: 20,
  }
});
