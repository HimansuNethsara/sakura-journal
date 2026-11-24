import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertNotificationRoot, Dialog, ALERT_TYPE } from "react-native-alert-notification";
import { Feather } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

type Note = {
  id: string;
  title: string;
  description: string;
  status: "active" | "archived" | "bin";
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "archive" | "bin">("notes");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const saved = await AsyncStorage.getItem("notes");
    if (saved) setNotes(JSON.parse(saved));
  };

  const saveNotes = async (updated: Note[]) => {
    setNotes(updated);
    await AsyncStorage.setItem("notes", JSON.stringify(updated));
  };

  const openAddModal = () => {
    setTitle("");
    setDescription("");
    setEditingNoteId(null);
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setTitle(note.title);
    setDescription(note.description);
    setEditingNoteId(note.id);
    setModalVisible(true);
  };

  const addOrUpdateNote = () => {
    if (!title.trim()) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Empty Title",
        textBody: "Please enter a note title!",
        button: "OK",
      });
      return;
    }

    if (editingNoteId) {
      const updatedNotes = notes.map((n) =>
        n.id === editingNoteId ? { ...n, title, description } : n
      );
      saveNotes(updatedNotes);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Note Updated",
        textBody: `"${title}" has been updated.`,
        button: "Great!",
      });
    } else {
      const note: Note = {
        id: Date.now().toString(),
        title,
        description,
        status: "active",
      };
      saveNotes([note, ...notes]);
    }

    setModalVisible(false);
    setTitle("");
    setDescription("");
    setEditingNoteId(null);
  };

  const moveToBin = (note: Note) => {
    if (note.status === "bin") {
      // Permanently delete
      const updated: Note[] = notes.filter((n) => n.id !== note.id);
      saveNotes(updated);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Deleted Permanently",
        textBody: `"${note.title}" has been deleted permanently.`,
        button: "OK",
      });
    } else {
      // Move to bin
      const updated: Note[] = notes.map((n) =>
        n.id === note.id ? { ...n, status: "bin" } : n
      );
      saveNotes(updated);
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Moved to Bin",
        textBody: `"${note.title}" moved to trash.`,
        button: "OK",
      });
    }
  };

  const restoreNote = (note: Note) => {
    const updated: Note[] = notes.map((n) =>
      n.id === note.id ? { ...n, status: "active" } : n
    );
    saveNotes(updated);
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Restored",
      textBody: `"${note.title}" has been restored.`,
      button: "OK",
    });
  };

  const archiveNote = (note: Note) => {
    saveNotes(
      notes.map((n) => (n.id === note.id ? { ...n, status: "archived" } : n))
    );
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Archived",
      textBody: `"${note.title}" archived successfully.`,
      button: "OK",
    });
  };

  const unarchiveNote = (note: Note) => {
    saveNotes(
      notes.map((n) => (n.id === note.id ? { ...n, status: "active" } : n))
    );
  };

  const filteredNotes = notes.filter((n) =>
    activeTab === "notes"
      ? n.status === "active"
      : activeTab === "archive"
      ? n.status === "archived"
      : n.status === "bin"
  );

  const renderRightActions = (note: Note) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {note.status !== "bin" && (
          <>
            <TouchableOpacity
              style={[styles.btnStyle, { backgroundColor: "#3b82f6" }]}
              onPress={() => openEditModal(note)}
            >
              <Text style={styles.actionText}>✏</Text>
            </TouchableOpacity>

            {note.status === "active" && (
              <TouchableOpacity
                style={[styles.btnStyle, { backgroundColor: "#f59e0b" }]}
                onPress={() => archiveNote(note)}
              >
                <Text style={styles.actionText}>📦</Text>
              </TouchableOpacity>
            )}

            {note.status === "archived" && (
              <TouchableOpacity
                style={[styles.btnStyle, { backgroundColor: "#047857" }]}
                onPress={() => unarchiveNote(note)}
              >
                <Text style={styles.actionText}>📤</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btnStyle, { backgroundColor: "#ef4444" }]}
              onPress={() => moveToBin(note)}
            >
              <Text style={styles.actionText}>🗑</Text>
            </TouchableOpacity>
          </>
        )}

        {note.status === "bin" && (
          <>
            <TouchableOpacity
              style={[styles.btnStyle, { backgroundColor: "#047857" }]}
              onPress={() => restoreNote(note)}
            >
              <Text style={styles.actionText}>↩️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnStyle, { backgroundColor: "#ef4444" }]}
              onPress={() => moveToBin(note)} // will permanently delete
            >
              <Text style={styles.actionText}>🗑</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.noteItem}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.noteDesc}>{item.description}</Text> : null}
      </View>
    </Swipeable>
  );

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>📝 My Notes</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Feather name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "notes" && styles.activeTabStyle]}
            onPress={() => setActiveTab("notes")}
          >
            <Text style={[styles.tabText, activeTab === "notes" && styles.activeTabText]}>
              Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "archive" && styles.activeTabStyle]}
            onPress={() => setActiveTab("archive")}
          >
            <Text style={[styles.tabText, activeTab === "archive" && styles.activeTabText]}>
              
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bin" && styles.activeTabStyle]}
            onPress={() => setActiveTab("bin")}
          >
            <Text style={[styles.tabText, activeTab === "bin" && styles.activeTabText]}>
              Bin
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No notes here ✨
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#db2777" }]}
                  onPress={addOrUpdateNote}
                >
                  <Text style={styles.modalBtnText}>{editingNoteId ? "Update" : "Save"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#ef4444" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff0f6", paddingTop: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#be123c" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#db2777",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#f9a8d4" },
  activeTabStyle: { backgroundColor: "#db2777" },
  tabText: { color: "#9d174d", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  noteItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#f9a8d4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  noteTitle: { fontSize: 18, fontWeight: "bold", color: "#9d174d", marginBottom: 4 },
  noteDesc: { fontSize: 14, color: "#444" },
  noteActions: { flexDirection: "row", marginTop: 8 },
  btnStyle: { justifyContent: "center", alignItems: "center", width: 60, height: 60, marginLeft: 4, borderRadius: 12 },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 16 },
  input: { backgroundColor: "#fff", borderColor: "#f9a8d4", borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 16, marginBottom: 12 },
  modalBtns: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginHorizontal: 4 },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
});
