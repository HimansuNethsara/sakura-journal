import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { Swipeable } from "react-native-gesture-handler";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed" | "archived";
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [search, setSearch] = useState("");
  const [buttonScale] = useState(new Animated.Value(1));
  const [showAddForm, setShowAddForm] = useState(false);
  const [formHeight] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState<
    "pending" | "completed" | "archived"
  >("pending");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Track alerted tasks so we don’t repeat dialogs
  const alertedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkOverdueTasks();
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [tasks]);

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  };

  const saveTasks = async (updated: Task[]) => {
    setTasks(updated);
    await AsyncStorage.setItem("tasks", JSON.stringify(updated));
  };

  // Check if a task is overdue
  const isOverdue = (task: Task) => {
    return task.status === "pending" && new Date(task.dueDate).getTime() < Date.now();
  };

  const checkOverdueTasks = () => {
    tasks.forEach((task) => {
      if (isOverdue(task) && !alertedTasks.current.has(task.id)) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "⚠️ Task Overdue",
          textBody: `"${task.title}" is past its due time!`,
          button: "OK",
        });
        alertedTasks.current.add(task.id);
      }
    });
  };

  const addOrUpdateTask = () => {
    if (!title.trim()) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Empty Title",
        textBody: "Please enter a task title!",
        button: "OK",
      });
      return;
    }

    if (editingTaskId) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingTaskId
          ? { ...t, title, description, dueDate: date.toISOString() }
          : t
      );
      saveTasks(updatedTasks);
      setEditingTaskId(null);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Task Updated",
        textBody: `"${title}" has been updated.`,
        button: "Great!",
      });
    } else {
      const task: Task = {
        id: Date.now().toString(),
        title,
        description,
        dueDate: date.toISOString(),
        status: "pending",
      };
      saveTasks([task, ...tasks]);
    }

    setTitle("");
    setDescription("");
    setDate(new Date());
    if (showAddForm) toggleAddForm();
  };

  const deleteTask = (id: string) =>
    saveTasks(tasks.filter((t) => t.id !== id));

  const archiveTask = (task: Task) =>
    saveTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: "archived" } : t
      )
    );

  const unarchiveTask = (task: Task) =>
    saveTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: "pending" } : t
      )
    );

  const completeTask = (task: Task) => {
    saveTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: "completed" } : t
      )
    );
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Task Completed 🎉",
      textBody: `"${task.title}" marked as completed!`,
      button: "Great!",
    });
  };

  const undoCompleteTask = (task: Task) =>
    saveTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: "pending" } : t
      )
    );

  const editTask = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setEditingTaskId(task.id);
    if (!showAddForm) toggleAddForm();
  };

  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    Animated.timing(formHeight, {
      toValue: showAddForm ? 0 : 350,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderRightActions = (item: Task) => {
    if (item.status === "archived") {
      return (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.btnStyle, { backgroundColor: "#3b82f6" }]}
            onPress={() => unarchiveTask(item)}
          >
            <Text style={styles.actionText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnStyle, { backgroundColor: "#ef4444" }]}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={styles.actionText}>🗑</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: "row" }}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.btnStyle, { backgroundColor: "#047857" }]}
            onPress={() => completeTask(item)}
          >
            <Text style={styles.actionText}>✅</Text>
          </TouchableOpacity>
        )}
        {item.status === "completed" && (
          <TouchableOpacity
            style={[styles.btnStyle, { backgroundColor: "#f59e0b" }]}
            onPress={() => undoCompleteTask(item)}
          >
            <Text style={styles.actionText}>↩️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnStyle, { backgroundColor: "#3b82f6" }]}
          onPress={() => editTask(item)}
        >
          <Text style={styles.actionText}>✏</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnStyle, { backgroundColor: "#f59e0b" }]}
          onPress={() => archiveTask(item)}
        >
          <Text style={styles.actionText}>📦</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnStyle, { backgroundColor: "#ef4444" }]}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.actionText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const completed = item.status === "completed";
    const overdue = isOverdue(item);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View
          style={[
            styles.taskItem,
            completed
              ? styles.completedCard
              : item.status === "archived"
              ? styles.archivedCard
              : overdue
              ? styles.overdueCard
              : styles.activeCard,
          ]}
        >
          <Text
            style={[
              styles.taskText,
              completed && {
                textDecorationLine: "line-through",
                color: "#047857",
              },
            ]}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.taskDesc}>{item.description}</Text>
          ) : null}
          <Text style={styles.dueDate}>
            📅 {new Date(item.dueDate).toLocaleString()}
          </Text>
        </View>
      </Swipeable>
    );
  };

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => t.status === activeTab);

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🌸 Sakura To-Do List</Text>

        <TextInput
          style={styles.search}
          placeholder="🔍 Search tasks..."
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.toggleBtn} onPress={toggleAddForm}>
          <Text style={styles.toggleBtnText}>
            {showAddForm
              ? "⬆ Hide Form"
              : editingTaskId
              ? "✏ Edit Task"
              : "➕ Add Task"}
          </Text>
        </TouchableOpacity>

        <Animated.View
          style={[styles.card, { height: formHeight, overflow: "hidden" }]}
        >
          {showAddForm && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  📅 {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowDatePicker(false);
                    if (d) setDate(d);
                  }}
                />
              )}
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateText}>
                  ⏰ {date.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={(e, t) => {
                    setShowTimePicker(false);
                    if (t) setDate(t);
                  }}
                />
              )}
              <Animated.View
                style={{ transform: [{ scale: buttonScale }], marginTop: 10 }}
              >
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={addOrUpdateTask}
                  onPressIn={() => animateButton(0.95)}
                  onPressOut={() => animateButton(1)}
                >
                  <Text style={styles.addBtnText}>
                    {editingTaskId ? "Update Task" : "Save Task"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </Animated.View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "pending" && styles.activeTabStyle,
            ]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              📝 Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "completed" && styles.activeTabStyle,
            ]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              ✅ Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "archived" && styles.activeTabStyle,
            ]}
            onPress={() => setActiveTab("archived")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "archived" && styles.activeTabText,
              ]}
            >

            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: "#666",
              }}
            >
              No tasks here ✨
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </SafeAreaView>
    </AlertNotificationRoot>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff0f6", paddingTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#be123c",
    marginVertical: 15,
    textAlign: "center",
  },
  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f9a8d4",
    fontSize: 16,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#f9a8d4",
  },
  activeTabStyle: { backgroundColor: "#db2777" },
  tabText: { color: "#9d174d", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  toggleBtn: {
    backgroundColor: "#db2777",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  toggleBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f9a8d4",
    fontSize: 16,
    marginBottom: 12,
  },
  dateBtn: {
    backgroundColor: "#f9a8d4",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: { color: "#9d174d", fontWeight: "bold" },
  addBtn: {
    backgroundColor: "#db2777",
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  taskItem: {
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCard: { backgroundColor: "#fff" },
  completedCard: { backgroundColor: "#d1fae5" },
  archivedCard: { backgroundColor: "#fef9c3" },
  taskText: { fontSize: 18, fontWeight: "600", color: "#9d174d" },
  taskDesc: { fontSize: 14, color: "#444", marginBottom: 4 },
  dueDate: { fontSize: 12, color: "#666" },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  btnStyle: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 80,
    marginLeft: 4,
    borderRadius: 10,
  },
  overdueCard: {
    backgroundColor: "#fee2e2",
    borderLeftWidth: 6,
    borderLeftColor: "#dc2626", 
  },

});
