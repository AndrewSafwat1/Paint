package com.example.paint.backend.paint.services;

import org.springframework.stereotype.Service;
import com.example.paint.backend.paint.services.shapes.Shape;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Stack;


@Service
public class PaintService {

    private Stack<List<Shape>> shapeStack = new Stack<>();
    private Stack<List<Shape>> redoStack  = new Stack<>();
    private HashMap<String, Shape> shapeMap = new HashMap<>();

    public void addShape(Shape shape) {
        List<Shape> current = getCurrentState();
        current.add(shape);
        saveState(current);
        shapeMap.put(shape.getId(), shape);
    }

    public List<Shape> removeShape(String shapeId) {
        List<Shape> current = getCurrentState();
        current.removeIf(s -> s.getId().equals(shapeId));
        saveState(current);
        shapeMap.remove(shapeId);
        return getCurrentState();
    }

    public Shape getShapeById(String shapeId) {
        return shapeMap.get(shapeId);
    }

    public void clearAllShapes() {
        saveState(new ArrayList<>());
        shapeMap.clear();
    }

    public void updateShape(Shape updated) {
        List<Shape> current = getCurrentState();
        for (int i = 0; i < current.size(); i++) {
            if (current.get(i).getId().equals(updated.getId())) {
                current.set(i, updated);
                break;
            }
        }
        saveState(current);
        rebuildMap();
    }

    public List<Shape> getCurrentShapes() {
        return getCurrentState();
    }

    public List<Shape> undo() {
        if (!shapeStack.isEmpty()) {
            redoStack.push(shapeStack.pop());
            rebuildMap();
            return getCurrentState();
        }
        return new ArrayList<>();
    }

    public List<Shape> redo() {
        if (!redoStack.isEmpty()) {
            shapeStack.push(redoStack.pop());
            rebuildMap();
        }
        return getCurrentState();
    }

    private List<Shape> getCurrentState() {
        return shapeStack.isEmpty() ? new ArrayList<>() : new ArrayList<>(shapeStack.peek());
    }

    private void saveState(List<Shape> shapes) {
        shapeStack.push(new ArrayList<>(shapes));
        redoStack.clear();
    }

    private void rebuildMap() {
        shapeMap.clear();
        for (Shape s : getCurrentState()) {
            shapeMap.put(s.getId(), s);
        }
    }

    public Save loadFromXML(String path) throws IOException {
        Save loaded = Save.loadFromXML(path);
        if (loaded != null) {
            saveState(new ArrayList<>(loaded.getLastUpdate()));
            rebuildMap();
        }
        return loaded;
    }

    public void saveToXML(String path, String idCounter) throws IOException {
        Save save = new Save();
        save.setIdCounter(idCounter);
        save.setLastUpdate(getCurrentState());
        save.saveToXML(path);
    }

    public void saveToJson(String path, String idCounter) throws IOException {
        Save save = new Save();
        save.setIdCounter(idCounter);
        save.setLastUpdate(getCurrentState());
        save.saveToJson(path);
    }

    public Save loadFromJson(String path) throws IOException {
        Save loaded = Save.loadToJson(path);
        if (loaded != null) {
            saveState(new ArrayList<>(loaded.getLastUpdate()));
            rebuildMap();
        }
        return loaded;
    }

    public String save(String path, String idCounter) throws IOException {
        if (path.endsWith("xml")) {
            saveToXML(path, idCounter);
            return "saved in " + path;
        } else if (path.endsWith("json")) {
            saveToJson(path, idCounter);
            return "saved in " + path;
        }
        return "unknown extension";
    }

    public Save load(String path) throws IOException {
        if (path.endsWith("xml"))  return loadFromXML(path);
        if (path.endsWith("json")) return loadFromJson(path);
        return null;
    }
}
