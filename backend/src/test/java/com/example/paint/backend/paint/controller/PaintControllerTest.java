package com.example.paint.backend.paint.controller;

import com.example.paint.backend.paint.services.PaintService;
import com.example.paint.backend.paint.services.Save;
import com.example.paint.backend.paint.services.shapes.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaintController.class)
class PaintControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean PaintService paintService;
    @MockBean ShapeFactory shapeFactory;

    // ── helpers ───────────────────────────────────────────────────────────────

    private Circle circle(String id) {
        ShapeDTO d = new ShapeDTO();
        d.id = id; d.name = "circle"; d.radius = 60;
        d.fill = "#fff"; d.stroke = "black"; d.strokeWidth = 3; d.draggable = true;
        return new Circle(d);
    }

    private String circleJson(String id) throws Exception {
        return """
                {"name":"circle","id":"%s","fill":"#fff","stroke":"black",
                 "strokeWidth":3,"draggable":true,"radius":60,"x":0,"y":0}
                """.formatted(id);
    }

    // ── POST /paint/create ────────────────────────────────────────────────────

    @Test
    void createShape_returns200WithCreatedShape() throws Exception {
        Circle c = circle("1");
        when(shapeFactory.createShape(any(ShapeDTO.class))).thenReturn(c);
        doNothing().when(paintService).addShape(any());

        mockMvc.perform(post("/paint/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(circleJson("1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("circle"))
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    void createShape_whenFactoryReturnsNull_returns500() throws Exception {
        when(shapeFactory.createShape(any(ShapeDTO.class))).thenReturn(null);
        doThrow(NullPointerException.class).when(paintService).addShape(null);

        mockMvc.perform(post("/paint/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(circleJson("1")))
                .andExpect(status().isInternalServerError());
    }

    // ── DELETE /paint/remove/{id} ─────────────────────────────────────────────

    @Test
    void removeShape_returns200WithRemainingList() throws Exception {
        when(paintService.removeShape("1")).thenReturn(List.of(circle("2")));

        mockMvc.perform(delete("/paint/remove/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("2"));
    }

    // ── POST /paint/undo ──────────────────────────────────────────────────────

    @Test
    void undo_returns200WithShapeList() throws Exception {
        when(paintService.undo()).thenReturn(List.of(circle("1")));

        mockMvc.perform(post("/paint/undo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("1"));
    }

    // ── POST /paint/redo ──────────────────────────────────────────────────────

    @Test
    void redo_returns200WithShapeList() throws Exception {
        when(paintService.redo()).thenReturn(List.of(circle("1"), circle("2")));

        mockMvc.perform(post("/paint/redo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ── POST /paint/clearAll ──────────────────────────────────────────────────

    @Test
    void clearAll_returns200() throws Exception {
        doNothing().when(paintService).clearAllShapes();

        mockMvc.perform(post("/paint/clearAll"))
                .andExpect(status().isOk());
    }

    // ── POST /paint/clone/{idOld}/{idNew} ─────────────────────────────────────

    @Test
    void clone_returns200WithClonedShape() throws Exception {
        Circle original = circle("1");
        Circle cloned = circle("99");
        when(paintService.getShapeById("1")).thenReturn(original);
        // Use real clone logic from the Circle subclass
        mockMvc.perform(post("/paint/clone/1/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("99"));
    }

    // ── POST /paint/saveContent ───────────────────────────────────────────────

    @Test
    void saveContent_returns200WithStringBody() throws Exception {
        when(paintService.saveAsString("json", "3")).thenReturn("{\"idCounter\":\"3\",\"lastUpdate\":[]}");

        mockMvc.perform(post("/paint/saveContent")
                        .param("format", "json")
                        .param("idCounter", "3"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("idCounter")));
    }

    // ── POST /paint/loadContent ───────────────────────────────────────────────

    @Test
    void loadContent_returns200WithSaveObject() throws Exception {
        Save save = new Save();
        save.setIdCounter("5");
        save.setLastUpdate(List.of());
        when(paintService.loadFromContent(anyString(), eq("json"))).thenReturn(save);

        mockMvc.perform(post("/paint/loadContent")
                        .param("format", "json")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("{\"idCounter\":\"5\",\"lastUpdate\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCounter").value("5"));
    }

    @Test
    void loadContent_whenServiceThrows_returns422() throws Exception {
        when(paintService.loadFromContent(anyString(), anyString()))
                .thenThrow(new java.io.IOException("bad content"));

        mockMvc.perform(post("/paint/loadContent")
                        .param("format", "json")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("invalid"))
                .andExpect(status().isUnprocessableEntity());
    }
}
