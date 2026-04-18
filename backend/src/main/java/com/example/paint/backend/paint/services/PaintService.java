package com.example.paint.backend.paint.services;

import org.springframework.stereotype.Service;
import com.example.paint.backend.paint.services.shapes.shape;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Stack;


@Service
public class PaintService {

    /*
     *
     * Paint Service class is Singelton class
     * as the program will only need one instance
     * from this class.
     * 
     */

    private static PaintService paintService = null;
    private PaintService() {
    }

    public static PaintService getInstance() {
        if (paintService == null) {
            paintService = new PaintService();
        }
        return paintService;
    }

    private Stack<List<shape>> shapeStack = new Stack<>();
    private Stack<List<shape>> redoStack = new Stack<>();


    private  HashMap<String, shape> shapeMap = new HashMap<>(); // for cloning purpose

    public void addshape(shape shape) {
        List<shape> currentshapes = getCurrentState();
        currentshapes.add(shape);
        saveState(currentshapes);
        shapeMap.put(shape.getId(), shape);
    }

    public List<shape> removeshape(String shapeId) {
        List<shape> currentshapes = getCurrentState();
        currentshapes.removeIf(shape -> shape.getId().equals(shapeId));
        saveState(currentshapes);
        return getCurrentState();
    }

    // used in cloning a shape 
    public   shape getShapeById(String shapeId) {
        return shapeMap.get(shapeId);
    }


    public void clearAllshapes() {
        saveState(new ArrayList<>());
    }


    public void updateshape(shape updatedshape) {
        List<shape> currentshapes = getCurrentState();
        for (int i = 0; i < currentshapes.size(); i++) {
            shape shape = currentshapes.get(i);
            if (shape.getId().equals(updatedshape.getId())) {
                currentshapes.set(i, updatedshape);
                break ;
            }
        }
        saveState(currentshapes);
        modifingMap();
    }
    public void modifingMap(){
        List<shape> currentshapes = getCurrentState();
        for (int i = 0; i < currentshapes.size(); i++) {
            shape shape = currentshapes.get(i);
            shapeMap.put(shape.getId(),shape) ;
        }
    }

    public List<shape> getCurrentshapes() {
        return getCurrentState();
    }
    
    public List<shape> undo() {
        if (!shapeStack.isEmpty()) {
            redoStack.push(shapeStack.pop());
            modifingMap() ;
            return getCurrentState();
        }

        return new ArrayList<shape>();
    }
    
    public List<shape> redo() {
        if (!redoStack.isEmpty()) {
            shapeStack.push(redoStack.pop());
            modifingMap();
            return getCurrentState();
        }
        modifingMap();
        return getCurrentState();
    }

    private List<shape> getCurrentState() {
        if (!shapeStack.isEmpty()) {
            return new ArrayList<>(shapeStack.peek());
        } else {
            return new ArrayList<>();
        }
    }

    private void saveState(List<shape> shapes) {
        shapeStack.push(new ArrayList<>(shapes));
        redoStack.clear();
    }


    public Save loadFromXML(String path) throws IOException {
        Save loadedSave = Save.loadFromXML(path);
        if (loadedSave != null) {
            List<shape> currentShapes = getCurrentState();
            currentShapes.addAll(loadedSave.getLastUpdate());
            saveState(currentShapes);
            modifingMap();
            return loadedSave;
        } else {
            return null;
        }
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
    public Save loadFromjson(String path) throws IOException {
        Save loadedSave = Save.loadToJson(path);
        if (loadedSave != null) {
            List<shape> currentShapes = getCurrentState();
            currentShapes.addAll(loadedSave.getLastUpdate());
            saveState(currentShapes);
            modifingMap();
            return loadedSave;
        } else {
            return null;
        }
    }
    public String saveFactory(String path, String idCounter) throws IOException {
        if(path.endsWith("xml")) {
            saveToXML(path, idCounter);
            return "saved in " + path ;
        }
        else if (path.endsWith("json")) {
            saveToJson(path, idCounter);
            return "saved in " + path ;
        }
        else
            return "unknown extension" ;
    }
    public Save loadFactory(String path) throws IOException {
        if(path.endsWith("xml")) {
            return  loadFromXML(path);
        }
        else if (path.endsWith("json")) {

            return loadFromjson(path);
        }
        else
            return null;
    }

}
