package com.example.paint.backend.paint.controller;

import com.example.paint.backend.paint.services.PaintService;
import com.example.paint.backend.paint.services.Save;
import com.example.paint.backend.paint.services.shapes.Shape;
import com.example.paint.backend.paint.services.shapes.ShapeDTO;
import com.example.paint.backend.paint.services.shapes.ShapeFactory;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/paint")
public class PaintController {

    @Autowired
    private PaintService paintService;

    @Autowired
    private ShapeFactory shapeFactory;

    @PostMapping("/create")
    public ResponseEntity<Object> createShape(@RequestBody ShapeDTO dto) {
        try {
            Shape obj = shapeFactory.createShape(dto);
            paintService.addShape(obj);
            return ResponseEntity.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

    @DeleteMapping("/remove/{shapeId}")
    public ResponseEntity<List<Shape>> removeShape(@PathVariable String shapeId) {
        try {
            return ResponseEntity.ok(paintService.removeShape(shapeId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/clearAll")
    public ResponseEntity<String> clearAllShapes() {
        try {
            paintService.clearAllShapes();
            return ResponseEntity.ok("All shapes cleared successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateShape(@RequestBody ShapeDTO dto) {
        try {
            Shape updated = shapeFactory.createShape(dto);
            paintService.updateShape(updated);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

    @PostMapping("/clone/{idOld}/{idNew}")
    public ResponseEntity<Shape> clone(@PathVariable String idOld, @PathVariable String idNew) {
        try {
            Shape cloned = paintService.getShapeById(idOld).clone(idNew);
            paintService.addShape(cloned);
            return ResponseEntity.ok(cloned);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/undo")
    public ResponseEntity<List<Shape>> undo() {
        try {
            return ResponseEntity.ok(paintService.undo());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/redo")
    public ResponseEntity<List<Shape>> redo() {
        try {
            return ResponseEntity.ok(paintService.redo());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<String> save(@RequestParam String path, @RequestParam String idCounter) {
        try {
            return ResponseEntity.ok(paintService.save(path, idCounter));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save shapes");
        }
    }

    @PostMapping("/load")
    public ResponseEntity<Save> load(@RequestParam String path) {
        try {
            Save loaded = paintService.load(path);
            if (loaded != null) return ResponseEntity.ok(loaded);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
