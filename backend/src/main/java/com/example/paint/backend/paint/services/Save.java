package com.example.paint.backend.paint.services;

import java.beans.XMLDecoder;
import java.beans.XMLEncoder;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import com.example.paint.backend.paint.services.shapes.shape;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Save {
    
    List<shape> lastUpdate = new ArrayList<>();
    String idCounter = null;

    public void setIdCounter(String idCounter){
        this.idCounter = idCounter;
    }

    public void setLastUpdate(List<shape> lastUpdate){
        this.lastUpdate = lastUpdate;
    }

    public String getIdCounter(){
        return this.idCounter;
    }

    public List<shape> getLastUpdate(){
        return this.lastUpdate;
    }

    public void saveToXML(String path) throws IOException {
        try (XMLEncoder encoder = new XMLEncoder(new BufferedOutputStream(new FileOutputStream(path)))) {
            encoder.writeObject(this);
        }
    }

    public static Save loadFromXML(String path) throws IOException {
        try (XMLDecoder decoder = new XMLDecoder(new BufferedInputStream(new FileInputStream(path)))) {
            return (Save) decoder.readObject();
        }
    }
    public void saveToJson(String path) throws IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(new File(path), this);
        }catch (IOException e){
            e.printStackTrace();
        }
    }
    public  static Save loadToJson(String path) throws IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Save object = mapper.readValue(new File(path), Save.class);
            return object;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

    }
}
