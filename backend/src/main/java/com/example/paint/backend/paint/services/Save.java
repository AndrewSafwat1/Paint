package com.example.paint.backend.paint.services;

import java.beans.XMLDecoder;
import java.beans.XMLEncoder;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import com.example.paint.backend.paint.services.shapes.Shape;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Save {

    private List<Shape> lastUpdate = new ArrayList<>();
    private String idCounter = null;

    public void setIdCounter(String idCounter)       { this.idCounter  = idCounter; }
    public void setLastUpdate(List<Shape> lastUpdate) { this.lastUpdate = lastUpdate; }
    public String getIdCounter()                     { return idCounter; }
    public List<Shape> getLastUpdate()               { return lastUpdate; }

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
        new ObjectMapper().writeValue(new File(path), this);
    }

    public static Save loadToJson(String path) throws IOException {
        try {
            return new ObjectMapper().readValue(new File(path), Save.class);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
