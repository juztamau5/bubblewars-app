import { ethers } from "ethers";
import { Edge, Vec2, World } from "planck-js";

export const massToRadius = (mass: number): number => {
    return Math.sqrt(mass / Math.PI);
};

export const radiusToMass = (radius: number): number => {
    return Math.PI * radius * radius;
}

export const createBoundary = (world: World, position: Vec2, dimensions:Vec2) => {
    let boundary = world.createBody({
        position: position,
        type: 'static'
    });

    boundary.createFixture({
        shape: Edge(Vec2(-dimensions.x / 2, -dimensions.y / 2), Vec2(dimensions.x / 2, dimensions.y / 2)),
        density: 0,
        friction: 0.5
    });
};

export const decodePacked = (types: string[], data:string) => {
    let offset = 2;
    let decoded: any[] = [];

    for (let type of types) {
        switch (type) {
            case 'bool':
                // Booleans are 1 byte, but in packed form, they might be represented differently
                decoded.push(data.slice(offset, offset + 2) === '01');
                offset += 2; // Increment by 2 characters (1 byte in hex)
                break;
            case 'address':
                // Addresses are 20 bytes (40 hex characters)
                decoded.push('0x' + data.slice(offset, offset + 40));
                offset += 40; // Increment by 40 characters (20 bytes in hex)
                break;
            case 'uint256':
                // uint256 are 32 bytes (64 hex characters)
                decoded.push(
                    Number(ethers.formatEther(BigInt('0x' + data.slice(offset, offset + 64)))))
                offset += 64; // Increment by 64 characters (32 bytes in hex)
                break;
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }

    return decoded;
}

export const truncateAddress = (address: string, length: number = 4): string => {
    return address.slice(0, 2 + length) + '...' + address.slice(-length);
}

export const ethereumAddressToColor =(ethAddress: string) => {
    if (!ethAddress || ethAddress.length !== 42 || !ethAddress.startsWith('0x')) {
        throw new Error('Invalid Ethereum address');
    }

    // Remove the '0x' prefix and convert the address to an array of characters
    const addressChars = ethAddress.substring(2).split('');

    // Convert each hex character to a decimal and sum them
    const sum = addressChars.reduce((acc, char) => acc + parseInt(char, 16), 0);

    // Modulate the sum to fit within 0xFFFFFF (the largest hex color code)
    const colorCode = sum % 0xFFFFFF;

    // Convert the result back to a hex string and pad with zeroes if necessary
    return `#${colorCode.toString(16).padStart(6, '0')}`;
}
