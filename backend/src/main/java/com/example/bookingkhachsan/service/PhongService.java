package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.PhongDto;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.KhuyenMai;
import com.example.bookingkhachsan.entity.LoaiPhong;
import com.example.bookingkhachsan.entity.Phong;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.LoaiPhongRepository;
import com.example.bookingkhachsan.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhongService {
    private final PhongRepository phongRepository;
    private final KhachSanRepository khachSanRepository;
    private final LoaiPhongRepository loaiPhongRepository;

    public List<Phong> getRoomsByHotel(Integer khachSanId) {
        return phongRepository.findByKhachSanId(khachSanId);
    }

    public Phong createRoom(Integer managerId, PhongDto dto) {
        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));

        LoaiPhong loaiPhong = loaiPhongRepository.findById(dto.getLoaiPhongId())
                .orElseThrow(() -> new RuntimeException("Loại phòng không tồn tại"));

        Phong phong = new Phong();
        mapDtoToEntity(dto, phong);
        phong.setKhachSan(hotel);
        phong.setLoaiPhong(loaiPhong);

        if (dto.getKhuyenMaiId() != null) {
            KhuyenMai km = new KhuyenMai();
            km.setId(dto.getKhuyenMaiId());
            phong.setKhuyenMai(km);
        }

        return phongRepository.save(phong);
    }

    public Phong updateRoom(Integer managerId, Integer roomId, PhongDto dto) {
        Phong phong = phongRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        // Verify the room belongs to the manager's hotel
        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));
        
        if (!phong.getKhachSan().getId().equals(hotel.getId())) {
            throw new RuntimeException("Phòng không thuộc khách sạn của bạn");
        }

        LoaiPhong loaiPhong = loaiPhongRepository.findById(dto.getLoaiPhongId())
                .orElseThrow(() -> new RuntimeException("Loại phòng không tồn tại"));

        mapDtoToEntity(dto, phong);
        phong.setLoaiPhong(loaiPhong);
        
        if (dto.getKhuyenMaiId() != null) {
            KhuyenMai km = new KhuyenMai();
            km.setId(dto.getKhuyenMaiId());
            phong.setKhuyenMai(km);
        } else {
            phong.setKhuyenMai(null);
        }

        return phongRepository.save(phong);
    }

    public void deleteRoom(Integer managerId, Integer roomId) {
        Phong phong = phongRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
                
        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));
                
        if (!phong.getKhachSan().getId().equals(hotel.getId())) {
            throw new RuntimeException("Phòng không thuộc khách sạn của bạn");
        }
        
        phongRepository.deleteById(roomId);
    }

    private void mapDtoToEntity(PhongDto dto, Phong phong) {
        phong.setTen(dto.getTen());
        phong.setMaPhong(dto.getMaPhong());
        phong.setGiaTien(dto.getGiaTien());
        phong.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : "Trống");
        phong.setTang(dto.getTang());
        phong.setSoPhong(dto.getSoPhong());
        phong.setMoTa(dto.getMoTa());
    }
}
