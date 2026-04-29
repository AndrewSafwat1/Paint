package com.example.paint.backend.paint.services;

import java.beans.XMLDecoder;
import java.beans.XMLEncoder;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.example.paint.backend.paint.services.shapes.Shape;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Save {

    private List<Shape> lastUpdate = new ArrayList<>();
    private String idCounter = null;

    public void setIdCounter(String idCounter)        { this.idCounter  = idCounter; }
    public void setLastUpdate(List<Shape> lastUpdate)  { this.lastUpdate = new ArrayList<>(lastUpdate); }
    public String getIdCounter()                      { return idCounter; }
    public List<Shape> getLastUpdate()                { return lastUpdate; }

    // ── file-based (kept for backward compat) ──────────────────────────────
    public void saveToXML(String path) throws IOException {
        try (XMLEncoder enc = new XMLEncoder(new BufferedOutputStream(new FileOutputStream(path)))) {
            enc.writeObject(this);
        }
    }

    public static Save loadFromXML(String path) throws IOException {
        try (XMLDecoder dec = new XMLDecoder(new BufferedInputStream(new FileInputStream(path)))) {
            return (Save) dec.readObject();
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

    // ── string-based (used by the file-dialog endpoints) ───────────────────
    public String toXmlString() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (XMLEncoder enc = new XMLEncoder(new BufferedOutputStream(baos))) {
            enc.writeObject(this);
        }
        return baos.toString(StandardCharsets.UTF_8.name());
    }

    public static Save fromXmlString(String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        try (XMLDecoder dec = new XMLDecoder(new BufferedInputStream(new ByteArrayInputStream(bytes)))) {
            return (Save) dec.readObject();
        }
    }

    public String toJsonString() throws IOException {
        return new ObjectMapper().writeValueAsString(this);
    }

    public static Save fromJsonString(String content) throws IOException {
        return new ObjectMapper().readValue(content, Save.class);
    }
}
